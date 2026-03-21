import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();

    // Always include credentials so refresh cookies work
    let authReq = req.clone({ withCredentials: true });

    // Attach access token if present
    if (token) {
      authReq = authReq.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // If unauthorized, try refreshing
        if (err.status === 401) {
          return this.auth.refresh().pipe(
            switchMap(res => {
              this.auth.setAccessToken(res.accessToken);
              this.auth.authRestored.next(true);

              const retryReq = authReq.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` }
              });

              return next.handle(retryReq);
            }),
            catchError(() => {
              // Refresh failed → user is logged out
              this.auth.clear();
              return throwError(() => err);
            })
          );
        }

        return throwError(() => err);
      })
    );
  }
}