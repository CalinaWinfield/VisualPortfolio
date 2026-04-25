// frontend/src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })

export class AuthService {

  private accessToken: string | null = null;

  authRestored = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  setAccessToken(token: string | null) {
    if (!token) return;
    this.accessToken = token;
    localStorage.setItem('accessToken', token);

  }

  getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  clear() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  refresh() {
    return this.http.post<{ accessToken: string }>(
      'http://localhost:5001/api/auth/refresh',
      {},
      { withCredentials: true }
    );
  }

  signup(payload: any) {
    return this.http.post(
      'http://localhost:5001/api/auth/register',
      payload,
      { withCredentials: true }
    );
  }

  getMfaSetup(userId: string) {
    return this.http.get<{ qrCode: string }>(
      `http://localhost:5001/api/auth/mfa/setup/${userId}`,
      { withCredentials: true }
    );
  }

  verifyMfaSetup(userId: string, code: string) {
    return this.http.post(
      `http://localhost:5001/api/auth/mfa/verify-setup`,
      { userId, code },
      { withCredentials: true }
    );
  }

  verifyMfaLogin(tempToken: string, code: string) {
    return this.http.post(
      `http://localhost:5001/api/auth/mfa/verify-login`,
      { tempToken, code },
      { withCredentials: true }
    );
  }

  getUserEmail(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      // JWT is three base64 parts split by '.' — the middle part is the payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email ?? null;
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }
}
