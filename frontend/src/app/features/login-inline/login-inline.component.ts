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
        this.auth.setAccessToken(res.accessToken);
        this.errorMessage = '';
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Invalid email or password.';
      }
    });
  }
}