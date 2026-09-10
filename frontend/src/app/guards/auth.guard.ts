// frontend/src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    const returnUrl = state?.url || '';
    if (returnUrl && returnUrl !== '/' && !returnUrl.startsWith('/login')) {
      this.router.navigate(['/login'], { queryParams: { returnUrl }, replaceUrl: true });
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    return false;
  }
}
