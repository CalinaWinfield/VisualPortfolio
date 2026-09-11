import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MfaEnrollmentComponent } from './mfa-enrollment.component';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

describe('MfaEnrollmentComponent', () => {
  let component: MfaEnrollmentComponent;
  let fixture: ComponentFixture<MfaEnrollmentComponent>;

  const authStub = {
    getMfaSetup: jasmine.createSpy('getMfaSetup').and.returnValue(of({ qrCode: 'data:image/png;base64,mockQr' })),
    verifyMfaSetup: jasmine.createSpy('verifyMfaSetup').and.returnValue(of({ accessToken: 'valid-jwt-token' })),
    setAccessToken: jasmine.createSpy('setAccessToken')
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  const activatedRouteStub = {
    queryParams: of({ userId: 'test-user-id-123' })
  };

  beforeEach(async () => {
    authStub.getMfaSetup = jasmine.createSpy('getMfaSetup').and.returnValue(of({ qrCode: 'data:image/png;base64,mockQr' }));
    authStub.verifyMfaSetup = jasmine.createSpy('verifyMfaSetup').and.returnValue(of({ accessToken: 'valid-jwt-token' }));
    authStub.setAccessToken = jasmine.createSpy('setAccessToken');
    routerStub.navigate = jasmine.createSpy('navigate');

    await TestBed.configureTestingModule({
      imports: [MfaEnrollmentComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MfaEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load QR code from userId query param', () => {
    expect(component).toBeTruthy();
    expect(component.userId).toBe('test-user-id-123');
    expect(authStub.getMfaSetup).toHaveBeenCalledWith('test-user-id-123');
    expect(component.qrCodeImage).toBe('data:image/png;base64,mockQr');
    expect(component.loading).toBeFalse();
  });

  it('submitCode should verify valid 6-digit code and navigate to /dashboard', () => {
    component.code = '123456';
    component.submitCode();

    expect(authStub.verifyMfaSetup).toHaveBeenCalledWith('test-user-id-123', '123456');
    expect(authStub.setAccessToken).toHaveBeenCalledWith('valid-jwt-token');
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
    expect(component.verifying).toBeFalse();
  });

  it('submitCode should display error if code is not 6 digits', () => {
    component.code = '123';
    component.submitCode();

    expect(authStub.verifyMfaSetup).not.toHaveBeenCalled();
    expect(component.error).toBe('Enter a valid 6-digit code.');
    expect(component.verifying).toBeFalse();
  });

  it('submitCode should handle API error', () => {
    authStub.verifyMfaSetup.and.returnValue(throwError(() => new Error('Invalid code')));
    component.code = '654321';
    component.submitCode();

    expect(component.error).toBe('Invalid code. Try again.');
    expect(component.verifying).toBeFalse();
  });

  it('onEnterKey should call submitCode when 6 digits are entered', () => {
    spyOn(component, 'submitCode');
    const fakeEvent = { preventDefault: jasmine.createSpy('preventDefault') } as unknown as Event;

    component.code = '654321';
    component.onEnterKey(fakeEvent);

    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(component.submitCode).toHaveBeenCalled();
  });

  it('onEnterKey should not submit if verifying is in progress', () => {
    spyOn(component, 'submitCode');
    component.verifying = true;
    component.code = '654321';

    component.onEnterKey();

    expect(component.submitCode).not.toHaveBeenCalled();
  });

  it('onEnterKey should set error if code is incomplete when Enter is pressed', () => {
    spyOn(component, 'submitCode');
    component.code = '123';

    component.onEnterKey();

    expect(component.submitCode).not.toHaveBeenCalled();
    expect(component.error).toBe('Enter a valid 6-digit code.');
  });
});
