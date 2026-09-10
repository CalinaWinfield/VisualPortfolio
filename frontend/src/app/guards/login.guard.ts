// frontend/src/app/guards/login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      // Logged in users cannot access or back-navigate to login routes without logging out first
      const role = this.auth.getUserRole();
      this.router.navigate([role === 'admin' ? '/admin' : '/dashboard'], { replaceUrl: true });
      return false;
    }
    return true;
  }
}
