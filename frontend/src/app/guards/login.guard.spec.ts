import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginGuard } from './login.guard';
import { AuthService } from '../auth.service';

describe('LoginGuard', () => {
  let guard: LoginGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        LoginGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(LoginGuard);
  });

  it('should allow unauthenticated users (guests) to view login/guest pages', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    const result = guard.canActivate();
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect logged-in standard users to /dashboard with replaceUrl', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('user');

    const result = guard.canActivate();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
  });

  it('should redirect logged-in admin users to /admin with replaceUrl', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('admin');

    const result = guard.canActivate();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin'], { replaceUrl: true });
  });
});
