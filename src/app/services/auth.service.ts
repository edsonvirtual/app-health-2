import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithCredential, GoogleAuthProvider, User, getRedirectResult, signInWithRedirect, UserCredential, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private auth: Auth, private firestore: Firestore, private router: Router, private uiService: UiService, private injector: Injector) {
    if (Capacitor.isNativePlatform()) {
      const clientId = environment.googleNativeClientId;
      if (clientId) {
        GoogleAuth.initialize({
          clientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      }
    }

    // Note: authState subscription is initialized by calling `init()` from
    // a component's lifecycle (AppComponent.ngOnInit) to ensure the call
    // executes inside Angular's injection context and avoids warnings.

    // Log de debug para monitorar mudanças de loading e user
    this.loading$.subscribe(value => {
      try { console.debug('[AuthService] loading$', value); } catch {};
    });
    this.user$.subscribe(u => {
      try { console.debug('[AuthService] user$', !!u, u?.uid); } catch {};
    });

    // getRedirectResult will be invoked from AppComponent.ngOnInit()
    // to ensure it runs inside the Angular injection context and
    // avoid "Firebase API called outside of an Injection context" warnings.
  }

  // Initialize subscriptions that must run inside Angular's injection context.
  init() {
    // Ensure this runs inside Angular's injection context.
    const obs = runInInjectionContext(this.injector, () => authState(this.auth));
    obs.subscribe((user) => {
      this.user$.next(user);
      this.loading$.next(false);
      if (user) {
        try {
          const current = this.router.url || '';
          if (current.startsWith('/login') || current === '/') {
            this.router.navigateByUrl('/home');
          }
        } catch (e) {
          // ignore navigation errors
        }
      }
    });
  }

  // Call to be invoked from an Angular component (e.g. AppComponent.ngOnInit())
  // to handle redirect results inside the Angular injection context.
  async handleRedirectResult(): Promise<void> {
    this.loading$.next(true);
    try {
      // run getRedirectResult inside injection context to avoid AngularFire warnings
      const result = await runInInjectionContext(this.injector, () => getRedirectResult(this.auth));
      if (result?.user) {
        await result.user.reload();
        this.user$.next(result.user);
        try { this.router.navigateByUrl('/home'); } catch (e) { console.warn('AuthService: navigation after redirect failed', e); }
      }
    } catch (error: any) {
      console.warn('Firebase redirect result error:', error);
    } finally {
      this.loading$.next(false);
    }
  }

  signUp(email: string, password: string): Promise<any> {
    this.loading$.next(true);
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(async (result) => {
        this.user$.next(result.user);
        await this.createUserProfile(result.user);
        return result;
      })
      .catch((error) => {
        const errorMessage = this.getAuthErrorMessage(error);
        console.error(errorMessage, error);
        throw new Error(errorMessage);
      })
      .finally(() => {
        this.loading$.next(false);
      });
  }

  signIn(email: string, password: string): Promise<any> {
    this.loading$.next(true);
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(async (result) => {
        this.user$.next(result.user);
        await this.createUserProfile(result.user);
        return result;
      })
      .catch((error) => {
        const errorMessage = this.getAuthErrorMessage(error);
        console.error(errorMessage, error);
        throw new Error(errorMessage);
      })
      .finally(() => {
        this.loading$.next(false);
      });
  }

  signInWithGoogle(): Promise<any> {
    this.loading$.next(true);

    const finalize = () => {
      this.loading$.next(false);
    };

    if (Capacitor.isNativePlatform()) {
      const clientId = environment.googleNativeClientId;

      if (!clientId) {
        const errorMessage = 'Google Native Client ID não configurado. Abra src/environments/environment.ts e adicione o Client ID nativo (ex: 1234...apps.googleusercontent.com). Para builds nativos, use o Client ID tipo Android/iOS do Google Cloud Console.';
        console.error(errorMessage);
        this.loading$.next(false);
        return Promise.reject(new Error(errorMessage));
      }

      GoogleAuth.initialize({
        clientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      return GoogleAuth.signIn()
        .then((result: any) => {
          const idToken = result?.authentication?.idToken || result?.idToken;
          if (!idToken) {
            throw new Error('Não foi possível obter o token do Google.');
          }
          const credential = GoogleAuthProvider.credential(idToken);
          return signInWithCredential(this.auth, credential);
        })
        .then(async (firebaseResult) => {
          this.user$.next(firebaseResult.user);
          await this.createUserProfile(firebaseResult.user);
          return firebaseResult;
        })
        .catch((error) => {
          const errorMessage = this.getAuthErrorMessage(error);
          console.error('Capacitor Google Auth error:', errorMessage, error);
          throw new Error(errorMessage);
        })
        .finally(finalize);
    }

    const provider = new GoogleAuthProvider();
    // If a web client id is provided, we can set custom params if needed in future
    provider.addScope('profile');
    provider.addScope('email');

    console.debug('[AuthService] signInWithGoogle: starting web flow (popup -> redirect fallback)');

    // Try popup first for better UX; fallback to redirect when popups are blocked.
    return signInWithPopup(this.auth, provider)
      .then(async (result: UserCredential) => {
        console.debug('[AuthService] signInWithGoogle: popup succeeded', !!result?.user);
        this.user$.next(result.user);
        await this.createUserProfile(result.user);
        return result;
      })
      .catch((error: any) => {
        console.warn('[AuthService] signInWithGoogle: popup failed, evaluating fallback', error?.code);
        const code = error?.code;
        if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user' || code === 'auth/operation-not-supported-in-this-environment') {
          console.debug('[AuthService] signInWithGoogle: using redirect fallback');
          // fallback to redirect flow
          return signInWithRedirect(this.auth, provider);
        }
        const errorMessage = this.getAuthErrorMessage(error);
        console.error('Firebase popup error:', errorMessage, error);
        throw new Error(errorMessage);
      })
      .finally(finalize);
  }

  logout(): Promise<void> {
    this.loading$.next(true);

    let finished = false;
    const finalize = () => {
      if (!finished) {
        finished = true;
        this.loading$.next(false);
      }
    };

    const signOutPromise = (async () => {
      try {
        await signOut(this.auth);
        this.user$.next(null);
      } catch (err) {
        console.warn('Erro no signOut, tentando retry rápido:', err);
        // retry once after short delay
        try {
          await new Promise(res => setTimeout(res, 300));
          await signOut(this.auth);
          this.user$.next(null);
        } catch (err2) {
          console.warn('Retry no signOut falhou:', err2);
          // Even if retry fails, clear local user state so UI can proceed
          this.user$.next(null);
        }
      } finally {
        finalize();
      }
    })();

    // Timeout fallback: if signOut hangs, force local logout after 2s
    const LOGOUT_FALLBACK_MS = 1000;
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!finished) {
          console.warn(`Timeout no signOut (${LOGOUT_FALLBACK_MS}ms) — forçando logout localmente`);
          // force dismiss loaders globally as last resort
          try { await this.uiService.forceDismissAll(); } catch (e) {}
          this.user$.next(null);
          finalize();
        }
        resolve();
      }, LOGOUT_FALLBACK_MS);
    });

    return Promise.race([signOutPromise, timeoutPromise]) as Promise<void>;
  }

  getUser(): Observable<User | null> {
    return this.user$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      map(user => !!user)
    );
  }

  private async createUserProfile(user: User | null): Promise<void> {
    if (!user || !user.email) {
      return;
    }

    const userDoc = doc(this.firestore, 'users', user.uid);
    // ensure Firestore getDoc/setDoc run inside Angular injection context
    const snapshot = await runInInjectionContext(this.injector, () => getDoc(userDoc));
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      updatedAt: serverTimestamp()
    };

    if (snapshot.exists()) {
      await runInInjectionContext(this.injector, () => setDoc(userDoc, data, { merge: true }));
    } else {
      await runInInjectionContext(this.injector, () => setDoc(userDoc, {
        ...data,
        createdAt: serverTimestamp()
      }, { merge: true }));
    }
  }

  private getAuthErrorMessage(error: any): string {
    let errorMessage = 'Ocorreu um erro. Tente novamente.';

    if (error?.code === 'auth/weak-password') {
      errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    } else if (error?.code === 'auth/email-already-in-use') {
      errorMessage = 'O e-mail já está em uso.';
    } else if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
      errorMessage = 'E-mail ou senha inválidos.';
    } else if (error?.code === 'auth/invalid-email') {
      errorMessage = 'Formato de e-mail inválido.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      errorMessage = 'Operação não autorizada. Ative o provedor no Firebase Authentication.';
    } else if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
      errorMessage = 'A autenticação pelo Google foi interrompida. Tente novamente.';
    }

    return errorMessage;
  }
}
