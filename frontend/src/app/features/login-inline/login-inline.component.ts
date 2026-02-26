// src/app/features/login-inline/login-inline.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  submitInline(): void {
    const email = (this.email || '').trim();
    const password = this.password || '';

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const token = 'fake-session-' + Math.random().toString(36).slice(2);
    try {
      localStorage.setItem('sessionToken', token);
      localStorage.setItem('sessionEmail', email);
    } catch {
      sessionStorage.setItem('sessionToken', token);
      sessionStorage.setItem('sessionEmail', email);
    }

    this.router.navigate(['/dashboard']);
  }
}