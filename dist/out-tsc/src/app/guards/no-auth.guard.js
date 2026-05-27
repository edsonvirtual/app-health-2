import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { onAuthStateChanged } from '@angular/fire/auth';
let NoAuthGuard = class NoAuthGuard {
    constructor(router, auth) {
        this.router = router;
        this.auth = auth;
    }
    canActivate(route, state) {
        return new Observable((observer) => {
            // Wait for Firebase Auth to initialize using injected Auth instance
            const unsubscribe = onAuthStateChanged(this.auth, (user) => {
                unsubscribe(); // Unsubscribe after first emission
                if (!user) {
                    observer.next(true);
                }
                else {
                    this.router.navigate(['/home']);
                    observer.next(false);
                }
                observer.complete();
            });
        });
    }
};
NoAuthGuard = __decorate([
    Injectable({
        providedIn: 'root'
    })
], NoAuthGuard);
export { NoAuthGuard };
//# sourceMappingURL=no-auth.guard.js.map