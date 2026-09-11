import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './auth.service';

describe('AppComponent (Navbar access)', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let mockRouter: any;
  let mockAuthService: any;
  let mockLocation: any;

  beforeEach(async () => {
    mockRouter = {
      url: '/dashboard',
      events: of(),
      navigate: jasmine.createSpy('navigate'),
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
      serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('')
    };

    mockAuthService = {
      getUserRole: jasmine.createSpy('getUserRole').and.returnValue('user'),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.callFake(() => !!localStorage.getItem('accessToken')),
      clear: jasmine.createSpy('clear').and.callFake(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
    };

    mockLocation = {
      back: jasmine.createSpy('back')
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: { snapshot: {}, paramMap: of() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  });

  it('should not show navbar when user is not logged in on any route', () => {
    localStorage.removeItem('accessToken');
    mockRouter.url = '/dashboard';
    expect(component.showNavbar).toBeFalse();
  });

  it('should not show navbar on the login/landing screen ("/") even if logged in', () => {
    localStorage.setItem('accessToken', 'mock-token');
    mockRouter.url = '/';
    expect(component.showNavbar).toBeFalse();
  });

  it('should not show navbar on "/home" even if logged in', () => {
    localStorage.setItem('accessToken', 'mock-token');
    mockRouter.url = '/home';
    expect(component.showNavbar).toBeFalse();
  });

  it('should not show navbar on "/login" even if logged in', () => {
    localStorage.setItem('accessToken', 'mock-token');
    mockRouter.url = '/login';
    expect(component.showNavbar).toBeFalse();
  });

  it('should not show navbar on "/mfa-login" or "/signup"', () => {
    localStorage.setItem('accessToken', 'mock-token');
    mockRouter.url = '/mfa-login';
    expect(component.showNavbar).toBeFalse();

    mockRouter.url = '/signup';
    expect(component.showNavbar).toBeFalse();
  });

  it('should show navbar on authenticated pages like "/dashboard" and "/documents" when logged in', () => {
    localStorage.setItem('accessToken', 'mock-token');

    mockRouter.url = '/dashboard';
    expect(component.showNavbar).toBeTrue();

    mockRouter.url = '/documents';
    expect(component.showNavbar).toBeTrue();
  });

  it('should render "Resume Builder" and "Cover Letter Builder" links in the navbar', () => {
    localStorage.setItem('accessToken', 'mock-token');
    mockRouter.url = '/dashboard';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navText = compiled.querySelector('.site-header')?.textContent || '';
    expect(navText).toContain('Resume Builder');
    expect(navText).toContain('Cover Letter Builder');
  });

  describe('Back Button & Route Protection', () => {
    beforeEach(() => {
      localStorage.setItem('accessToken', 'mock-token');
    });

    it('should hide back button on root dashboard for logged-in user', () => {
      component.updateBackButton('/dashboard');
      expect(component.showBackButton).toBeFalse();
    });

    it('should hide back button on /admin for logged-in admin user', () => {
      mockAuthService.getUserRole.and.returnValue('admin');
      component.updateBackButton('/admin');
      expect(component.showBackButton).toBeFalse();
    });

    it('should hide back button on login/guest routes even if token is present', () => {
      component.updateBackButton('/login');
      expect(component.showBackButton).toBeFalse();

      component.updateBackButton('/signup');
      expect(component.showBackButton).toBeFalse();
    });

    it('should show back button on internal application routes (e.g. /documents, /guide)', () => {
      component.updateBackButton('/documents');
      expect(component.showBackButton).toBeTrue();

      component.updateBackButton('/guide');
      expect(component.showBackButton).toBeTrue();
    });

    it('should navigate back safely within authenticated history via goBack()', () => {
      component.authHistory = ['/dashboard', '/documents'];
      component.goBack();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('should fallback to /dashboard if authHistory has no previous route', () => {
      component.authHistory = ['/documents'];
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
    });

    it('should redirect back to dashboard on popstate if user tries to reach a login route while logged in', () => {
      component.onPopState('/login');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
    });

    it('logout() should clear auth and navigate to /login with replaceUrl', () => {
      component.logout();
      expect(mockAuthService.clear).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
      expect(component.authHistory.length).toBe(0);
    });
  });
});
