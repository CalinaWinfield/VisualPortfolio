import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MfaLoginComponent } from './mfa-login.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

describe('MfaLoginComponent', () => {
  let component: MfaLoginComponent;
  let fixture: ComponentFixture<MfaLoginComponent>;

  const httpStub = {
    post: jasmine.createSpy('post').and.returnValue(of({ accessToken: 'login-token-123' }))
  };

  const authStub = {
    setAccessToken: jasmine.createSpy('setAccessToken'),
    getUserRole: jasmine.createSpy('getUserRole').and.returnValue('user')
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    httpStub.post = jasmine.createSpy('post').and.returnValue(of({ accessToken: 'login-token-123' }));
    authStub.setAccessToken = jasmine.createSpy('setAccessToken');
    authStub.getUserRole = jasmine.createSpy('getUserRole').and.returnValue('user');
    routerStub.navigate = jasmine.createSpy('navigate');
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [MfaLoginComponent],
      providers: [
        { provide: HttpClient, useValue: httpStub },
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MfaLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submitCode should show error if tempToken is missing', () => {
    component.code = '123456';
    component.submitCode();

    expect(component.errorMessage).toBe('Missing MFA session. Please log in again.');
    expect(httpStub.post).not.toHaveBeenCalled();
  });

  it('submitCode should show error if code is not 6 digits', () => {
    sessionStorage.setItem('tempToken', 'test-temp-token');
    component.code = '123';
    component.submitCode();

    expect(component.errorMessage).toBe('Enter a valid 6-digit code.');
    expect(httpStub.post).not.toHaveBeenCalled();
  });

  it('submitCode should call API and navigate to dashboard for regular user', () => {
    sessionStorage.setItem('tempToken', 'test-temp-token');
    component.code = '123456';
    component.submitCode();

    expect(httpStub.post).toHaveBeenCalledWith(
      'http://localhost:5001/api/auth/mfa/verify-login',
      { tempToken: 'test-temp-token', code: '123456' },
      { withCredentials: true }
    );
    expect(authStub.setAccessToken).toHaveBeenCalledWith('login-token-123');
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
  });

  it('submitCode should navigate to /admin for admin user', () => {
    sessionStorage.setItem('tempToken', 'test-temp-token');
    authStub.getUserRole.and.returnValue('admin');
    component.code = '123456';
    component.submitCode();

    expect(routerStub.navigate).toHaveBeenCalledWith(['/admin'], { replaceUrl: true });
  });

  it('onEnterKey should prevent default and call submitCode', () => {
    spyOn(component, 'submitCode');
    const fakeEvent = { preventDefault: jasmine.createSpy('preventDefault') } as unknown as Event;

    component.onEnterKey(fakeEvent);

    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(component.submitCode).toHaveBeenCalled();
  });

  it('onEnterKey should do nothing if verifying is in progress', () => {
    spyOn(component, 'submitCode');
    component.verifying = true;

    component.onEnterKey();

    expect(component.submitCode).not.toHaveBeenCalled();
  });
});
