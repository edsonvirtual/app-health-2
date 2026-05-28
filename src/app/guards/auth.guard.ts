import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Auth, authState } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private auth: Auth,
    private injector: Injector
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Run authState inside injection context to avoid AngularFire warnings.
    const obs = runInInjectionContext(this.injector, () => authState(this.auth));
    return (obs).pipe(
      take(1),
      map(user => {
        if (user) return true;
        // not authenticated — navigate to login and block
        try { this.router.navigate(['/login']); } catch (e) {}
        return false;
      })
    );
  }
}
