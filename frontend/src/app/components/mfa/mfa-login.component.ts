// frontend/src/app/components/mfa/mfa-login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-mfa-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mfa-login.component.html',
  styleUrls: ['./mfa-login.component.css']
})
export class MfaLoginComponent {

  code = '';
  errorMessage = '';
  resetting = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  submitCode() {
    const tempToken = sessionStorage.getItem('tempToken');
    const normalizedCode = this.code.replace(/\D/g, '');

    if (!tempToken) {
      this.errorMessage = 'Missing MFA session. Please log in again.';
      return;
    }
    if (normalizedCode.length !== 6) {
      this.errorMessage = 'Enter a valid 6-digit code.';
      return;
    }

    this.http.post<any>(
      'http://localhost:5001/api/auth/mfa/verify-login',
      { tempToken, code: normalizedCode },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.auth.setAccessToken(res.accessToken);
        const role = this.auth.getUserRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Invalid MFA code.';
      }
    });
  }

  resetMfa(): void {
    const tempToken = sessionStorage.getItem('tempToken');
    if (!tempToken) {
      this.errorMessage = 'Missing MFA session. Please log in again.';
      return;
    }

    this.resetting = true;
    this.errorMessage = '';

    this.http.post<any>(
      'http://localhost:5001/api/auth/mfa/reset',
      { tempToken },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.resetting = false;
        this.router.navigate(['/enroll-mfa'], {
          queryParams: { userId: res.userId }
        });
      },
      error: (err) => {
        this.resetting = false;
        this.errorMessage = err?.error?.error || 'Could not reset MFA. Please log in again.';
      }
    });
  }
}