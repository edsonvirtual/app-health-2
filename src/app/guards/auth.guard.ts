import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private auth: Auth
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      // Wait for Firebase Auth to initialize using injected Auth instance
      // Add a timeout fallback to avoid indefinite waiting and navigation loops
      let done = false;
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        if (done) return;
        done = true;
        unsubscribe(); // Unsubscribe after first emission
        if (user) {
          observer.next(true);
        } else {
          this.router.navigate(['/login']);
          observer.next(false);
        }
        observer.complete();
      });

      // Fallback: if auth state not resolved within 5s, treat as not authenticated
      const timeout = setTimeout(() => {
        if (done) return;
        done = true;
        try { unsubscribe(); } catch (e) {}
        this.router.navigate(['/login']);
        observer.next(false);
        observer.complete();
      }, 5000);
      // cleanup on complete
      return () => { clearTimeout(timeout); try { unsubscribe(); } catch (e) {} };
    });
  }
}
