import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithCredential, GoogleAuthProvider, getRedirectResult, signInWithRedirect, signInWithPopup } from '@angular/fire/auth';
import { doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
let AuthService = class AuthService {
    constructor(auth, firestore) {
        this.auth = auth;
        this.firestore = firestore;
        this.user$ = new BehaviorSubject(null);
        this.loading$ = new BehaviorSubject(false);
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
            .then((result) => {
            if (result?.user) {
                return result.user.reload().then(() => {
                    this.user$.next(result.user);
                });
            }
            return Promise.resolve();
        })
            .catch((error) => {
            console.warn('Firebase redirect result error:', error);
            this.loading$.next(false);
        });
    }
    signUp(email, password) {
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
    signIn(email, password) {
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
    signInWithGoogle() {
        this.loading$.next(true);
        const finalize = () => {
            this.loading$.next(false);
        };
        if (Capacitor.isNativePlatform()) {
            const clientId = environment.googleClientId;
            if (!clientId) {
                const errorMessage = 'Google Native Client ID não configurado. Verifique environment.ts.';
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
                .then((result) => {
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
            .then(async (result) => {
            this.user$.next(result.user);
            await this.createUserProfile(result.user);
            return result;
        })
            .catch((error) => {
            const errorMessage = this.getAuthErrorMessage(error);
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/operation-not-supported-in-this-environment') {
                return signInWithRedirect(this.auth, provider);
            }
            console.error('Firebase popup error:', errorMessage, error);
            throw new Error(errorMessage);
        })
            .finally(finalize);
    }
    logout() {
        this.loading$.next(true);
        return signOut(this.auth)
            .then(() => {
            this.user$.next(null);
        })
            .finally(() => {
            this.loading$.next(false);
        });
    }
    getUser() {
        return this.user$.asObservable();
    }
    getLoading() {
        return this.loading$.asObservable();
    }
    isAuthenticated() {
        return this.user$.asObservable().pipe(map(user => !!user));
    }
    async createUserProfile(user) {
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
        }
        else {
            await setDoc(userDoc, {
                ...data,
                createdAt: serverTimestamp()
            }, { merge: true });
        }
    }
    getAuthErrorMessage(error) {
        let errorMessage = 'Ocorreu um erro. Tente novamente.';
        if (error?.code === 'auth/weak-password') {
            errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
        }
        else if (error?.code === 'auth/email-already-in-use') {
            errorMessage = 'O e-mail já está em uso.';
        }
        else if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
            errorMessage = 'E-mail ou senha inválidos.';
        }
        else if (error?.code === 'auth/invalid-email') {
            errorMessage = 'Formato de e-mail inválido.';
        }
        else if (error?.code === 'auth/operation-not-allowed') {
            errorMessage = 'Operação não autorizada. Ative o provedor no Firebase Authentication.';
        }
        else if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
            errorMessage = 'A autenticação pelo Google foi interrompida. Tente novamente.';
        }
        return errorMessage;
    }
};
AuthService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map