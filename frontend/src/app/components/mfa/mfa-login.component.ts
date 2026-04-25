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

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  submitCode() {
    const tempToken = sessionStorage.getItem('tempToken');

    if (!tempToken) {
      this.errorMessage = 'Missing MFA session. Please log in again.';
      return;
    }

    this.http.post<any>(
      'http://localhost:5001/api/auth/mfa/verify-login',
      { tempToken, code: this.code },
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
}