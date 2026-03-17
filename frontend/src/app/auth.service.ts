import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;

  // Emits when the user logs in again after expiration
  authRestored = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  // Store the access token in memory
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Read the access token for the interceptor
  getAccessToken() {
    return this.accessToken;
  }

  // Clear token on logout or refresh failure
  clear() {
    this.accessToken = null;
  }

  // Call backend to refresh the access token
  refresh() {
    return this.http.post<{ accessToken: string }>(
      'http://localhost:5001/api/auth/refresh',
      {},
      { withCredentials: true }
    );
  }

  // Optional: real signup if you want it later
  signup(payload: any) {
    return this.http.post(
      'http://localhost:5001/api/auth/register',
      payload,
      { withCredentials: true }
    );
  }
}