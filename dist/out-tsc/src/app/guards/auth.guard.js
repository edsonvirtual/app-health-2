import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { onAuthStateChanged } from '@angular/fire/auth';
let AuthGuard = class AuthGuard {
    constructor(authService, router, auth) {
        this.authService = authService;
        this.router = router;
        this.auth = auth;
    }
    canActivate(route, state) {
        return new Observable((observer) => {
            // Wait for Firebase Auth to initialize using injected Auth instance
            const unsubscribe = onAuthStateChanged(this.auth, (user) => {
                unsubscribe(); // Unsubscribe after first emission
                if (user) {
                    observer.next(true);
                }
                else {
                    this.router.navigate(['/login']);
                    observer.next(false);
                }
                observer.complete();
            });
        });
    }
};
AuthGuard = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthGuard);
export { AuthGuard };
//# sourceMappingURL=auth.guard.js.map