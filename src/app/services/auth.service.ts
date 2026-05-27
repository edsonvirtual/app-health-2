import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithCredential, GoogleAuthProvider, User, getRedirectResult, signInWithRedirect, UserCredential, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private auth: Auth, private firestore: Firestore) {
    if (Capacitor.isNativePlatform()) {
      const clientId = environment.googleClientId;
      if (clientId) {
        GoogleAuth.initialize({
          clientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      }
    }

    authState(this.auth).subscribe((user) => {
      this.user$.next(user);
      this.loading$.next(false);
    });

    getRedirectResult(this.auth)
      .then((result: UserCredential | null) => {
        if (result?.user) {
          return result.user.reload().then(() => {
            this.user$.next(result.user);
          });
        }
        return Promise.resolve();
      })
      .catch((error: any) => {
        console.warn('Firebase redirect result error:', error);
        this.loading$.next(false);
      });
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
      const clientId = environment.googleClientId;

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
    provider.addScope('profile');
    provider.addScope('email');

    return signInWithPopup(this.auth, provider)
      .then(async (result: UserCredential) => {
        this.user$.next(result.user);
        await this.createUserProfile(result.user);
        return result;
      })
      .catch((error: any) => {
        const errorMessage = this.getAuthErrorMessage(error);
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/operation-not-supported-in-this-environment') {
          return signInWithRedirect(this.auth, provider);
        }
        console.error('Firebase popup error:', errorMessage, error);
        throw new Error(errorMessage);
      })
      .finally(finalize);
  }

  logout(): Promise<void> {
    this.loading$.next(true);
    return signOut(this.auth)
      .then(() => {
        this.user$.next(null);
      })
      .finally(() => {
        this.loading$.next(false);
      });
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
    const snapshot = await getDoc(userDoc);
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      updatedAt: serverTimestamp()
    };

    if (snapshot.exists()) {
      await setDoc(userDoc, data, { merge: true });
    } else {
      await setDoc(userDoc, {
        ...data,
        createdAt: serverTimestamp()
      }, { merge: true });
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
