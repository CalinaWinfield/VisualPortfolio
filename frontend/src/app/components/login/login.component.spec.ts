import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Login } from './login.component';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let el: HTMLElement;
  let originalFetch: any;

  beforeEach(async () => {
    // Save any existing fetch implementation so we can restore it later
    originalFetch = (window as any).fetch;

    await TestBed.configureTestingModule({
      declarations: [Login],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(Login, {
      set: {
        template: `
          <div>
            <form id="inlineLoginForm">
              <input id="inlineEmail" type="email" />
              <input id="inlinePassword" type="password" />
              <div id="inlineError" class="inline-error"></div>
              <button type="submit">Log in</button>
            </form>

            <div id="loginModal" class="modal">
              <form id="loginForm">
                <input id="loginEmail" type="email" />
                <input id="loginPassword" type="password" />
                <div id="loginError" class="text-danger small d-none"></div>
                <button type="submit">Sign in</button>
              </form>
            </div>

            <div id="mfaModal" class="modal">
              <form id="mfaForm">
                <input id="otpInput" type="text" maxlength="6" />
                <div id="otpTimer">--:--</div>
                <button id="resendBtn" type="button">Resend</button>
                <div id="mfaInfo"></div>
                <div id="mfaError" class="text-danger small d-none"></div>
                <button type="submit">Verify</button>
              </form>
            </div>

            <div id="successToastInner" class="toast">
              <div class="toast-body"></div>
            </div>
          </div>
        `
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restore original fetch implementation (if any)
    (window as any).fetch = originalFetch;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call /auth/start when login form is submitted', async () => {
    const loginEmail = el.querySelector('#loginEmail') as HTMLInputElement;
    const loginPassword = el.querySelector('#loginPassword') as HTMLInputElement;
    const loginForm = el.querySelector('#loginForm') as HTMLFormElement;

    loginEmail.value = 'test@example.com';
    loginPassword.value = 'password123';
    loginEmail.dispatchEvent(new Event('input'));
    loginPassword.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const startResponse = { ok: true, ttl: 60, resendLeft: 3, message: 'Sent' };
    // Ensure fetch exists and is a Jasmine spy that returns a plain object with json()
    (window as any).fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve(startResponse)
    }));

    loginForm.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect((window as any).fetch).toHaveBeenCalled();
    const firstCallArg = ((window as any).fetch as jasmine.Spy).calls.mostRecent().args[0];
    expect(firstCallArg).toBe('/auth/start');
  });

  it('should call /auth/verify when MFA form is submitted with a 6-digit code', async () => {
    const loginEmail = el.querySelector('#loginEmail') as HTMLInputElement;
    const otpInput = el.querySelector('#otpInput') as HTMLInputElement;
    const mfaForm = el.querySelector('#mfaForm') as HTMLFormElement;

    loginEmail.value = 'verify@example.com';
    loginEmail.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const startResponse = { ok: true, ttl: 60, resendLeft: 3, message: 'Sent' };
    const verifyResponse = { ok: true, message: 'Verified' };

    // Provide a fetch spy that returns different payloads depending on the URL
    (window as any).fetch = jasmine.createSpy('fetch').and.callFake((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      if (typeof url === 'string' && url.endsWith('/auth/verify')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(verifyResponse) } as any);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(startResponse) } as any);
    });

    otpInput.value = '123456';
    otpInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    mfaForm.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect((window as any).fetch).toHaveBeenCalled();
    const calledArgs = ((window as any).fetch as jasmine.Spy).calls.allArgs().map(a => a[0] as string);
    const foundVerify = calledArgs.some(url => typeof url === 'string' && url.endsWith('/auth/verify'));
    expect(foundVerify).toBeTrue();
  });
});