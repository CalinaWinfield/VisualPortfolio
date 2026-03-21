import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })

export class AuthService {

  private accessToken: string | null = null;

  authRestored = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  setAccessToken(token: string) {
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
}
