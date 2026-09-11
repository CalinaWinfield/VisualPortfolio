// frontend/src/app/features/login-inline/login-inline.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login-inline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-inline.component.html',
  styleUrls: ['./login-inline.component.css']
})
export class LoginInlineComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  submitInline(): void {
    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.http.post<any>(
      'http://localhost:5001/api/auth/login',
      { email, password },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {

        console.log("RAW RESPONSE:", res);

        // ⭐ OPTION B — Redirect to QR enrollment instead of TOTP-only signup
        if (res.mfaRequired === true || res.mfaRequired === "true") {
          console.log("MFA BRANCH TRIGGERED");

          sessionStorage.setItem('tempToken', res.tempToken);

          // ⭐ Redirect to QR login instead of TOTP-only login
          this.router.navigate(['/mfa-login']);

          return;
        }

        // Normal login success (no MFA)
        this.auth.setAccessToken(res.accessToken);
        if (res.user?.name) {
          this.auth.setUserName(res.user.name);
        }
        this.errorMessage = '';
        const role = this.auth.getUserRole();
        if (role === 'admin') {
          this.router.navigate(['/admin'], { replaceUrl: true });
        } else {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
      },

      error: (err) => {
        if (err.error?.redirectTo === '/enroll-mfa') {
          this.router.navigate(['/enroll-mfa'], {
            queryParams: { userId: err.error.userId }
          });
          return;
        }

        this.errorMessage = err?.error?.error || 'Invalid email or password.';
      }
    });
  }
}