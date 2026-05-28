import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router, private auth: Auth, private injector: Injector) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Ensure the AngularFire call runs inside Angular's injection context.
    const obs = runInInjectionContext(this.injector, () => authState(this.auth));
    return (obs).pipe(
      take(1),
      map(user => {
        if (!user) {
          return true;
        }
        try { this.router.navigate(['/home']); } catch (e) {}
        return false;
      })
    );
  }
}
