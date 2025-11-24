import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Minimal stub used for tests. Replace with real implementation as needed.
  signup(payload: any) {
    return of({ token: 'stub-token' });
  }
}
