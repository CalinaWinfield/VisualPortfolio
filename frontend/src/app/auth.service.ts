import { Injectable } from '@angular/core';
import { of } from 'rxjs';


@Injectable({ providedIn: 'root' })

export class AuthService {
  signup(payload: any) {
    return of({ token: 'stub-token' });
  }
}
