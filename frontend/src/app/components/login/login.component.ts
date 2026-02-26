import { Component, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class Login implements AfterViewInit, OnDestroy {
  // UI state (kept simple so the existing static HTML can be used)
  loginError = '';
  inlineError = '';
  mfaError = '';
  mfaInfo = '';
  otpTimerText = '--:--';

  // MFA state
  private otpExpiresAt = 0;
  private resendLeft = 0;
  private otpIntervalId: number | null = null;

  // Keep references to event handlers so we can remove them on destroy
  private inlineSubmitHandler: EventListener | null = null;
  private modalLoginSubmitHandler: EventListener | null = null;
  private mfaSubmitHandler: EventListener | null = null;
  private resendClickHandler: EventListener | null = null;

  constructor() {}

  ngAfterViewInit(): void {
    // Wire up the existing DOM forms (the HTML file you provided uses IDs)
    const inlineForm = document.getElementById('inlineLoginForm') as HTMLFormElement | null;
    const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
    const mfaForm = document.getElementById('mfaForm') as HTMLFormElement | null;
    const resendBtn = document.getElementById('resendBtn') as HTMLButtonElement | null;

    // Inline form submit: validate and open modal with values
    if (inlineForm) {
      this.inlineSubmitHandler = (e: Event) => {
        e.preventDefault();
        this.inlineError = '';
        const inlineEmail = (document.getElementById('inlineEmail') as HTMLInputElement | null)?.value.trim() || '';
        const inlinePassword = (document.getElementById('inlinePassword') as HTMLInputElement | null)?.value || '';

        if (!inlineEmail || !inlinePassword) {
          this.inlineError = 'Please enter email and password.';
          this.updateInlineErrorElement();
          return;
        }

        if (!/^\S+@\S+\.\S+$/.test(inlineEmail)) {
          this.inlineError = 'Please enter a valid email address.';
          this.updateInlineErrorElement();
          return;
        }

        // Populate modal inputs and show modal (Bootstrap modal is in the HTML)
        const loginEmailEl = document.getElementById('loginEmail') as HTMLInputElement | null;
        const loginPasswordEl = document.getElementById('loginPassword') as HTMLInputElement | null;
        if (loginEmailEl) loginEmailEl.value = inlineEmail;
        if (loginPasswordEl) loginPasswordEl.value = inlinePassword;

        // Clear inline error UI
        this.inlineError = '';
        this.updateInlineErrorElement();

        // Show modal using Bootstrap's data API (the HTML includes bootstrap bundle)
        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl && (window as any).bootstrap) {
          const bsModal = (window as any).bootstrap.Modal.getOrCreateInstance(loginModalEl);
          bsModal.show();
        }
      };
      inlineForm.addEventListener('submit', this.inlineSubmitHandler);
    }

    // Modal login submit: start OTP flow (server-driven)
    if (loginForm) {
      this.modalLoginSubmitHandler = (e: Event) => {
        e.preventDefault();
        this.loginError = '';
        const loginEmail = (document.getElementById('loginEmail') as HTMLInputElement | null)?.value.trim() || '';
        const loginPassword = (document.getElementById('loginPassword') as HTMLInputElement | null)?.value || '';

        if (!loginEmail || !loginPassword) {
          this.loginError = 'Please enter email and password.';
          this.updateLoginErrorElement();
          return;
        }

        if (!/^\S+@\S+\.\S+$/.test(loginEmail)) {
          this.loginError = 'Please enter a valid email address.';
          this.updateLoginErrorElement();
          return;
        }

        this.loginError = '';
        this.updateLoginErrorElement();

        // Start server-driven OTP flow
        this.startOtpFlow(loginEmail);
      };
      loginForm.addEventListener('submit', this.modalLoginSubmitHandler);
    }

    // MFA submit: verify code with server
    if (mfaForm) {
      this.mfaSubmitHandler = (e: Event) => {
        e.preventDefault();
        this.mfaError = '';
        const code = (document.getElementById('otpInput') as HTMLInputElement | null)?.value.trim() || '';
        const loginEmail = (document.getElementById('loginEmail') as HTMLInputElement | null)?.value.trim() || '';

        if (!code || code.length !== 6) {
          this.mfaError = 'Enter the 6-digit code.';
          this.updateMfaErrorElement();
          return;
        }

        if (Date.now() > this.otpExpiresAt) {
          this.mfaError = 'Code expired. Please resend.';
          this.updateMfaErrorElement();
          return;
        }

        // Call server verify
        this.verifyCode(loginEmail, code);
      };
      mfaForm.addEventListener('submit', this.mfaSubmitHandler);
    }

    // Resend button
    if (resendBtn) {
      this.resendClickHandler = (e: Event) => {
        e.preventDefault();
        const loginEmail = (document.getElementById('loginEmail') as HTMLInputElement | null)?.value.trim() || '';
        if (!loginEmail) {
          this.mfaError = 'Email missing. Please restart sign-in.';
          this.updateMfaErrorElement();
          return;
        }
        this.resendOtp(loginEmail);
      };
      resendBtn.addEventListener('click', this.resendClickHandler);
    }
  }

  ngOnDestroy(): void {
    // Remove event listeners to avoid leaks
    const inlineForm = document.getElementById('inlineLoginForm') as HTMLFormElement | null;
    const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
    const mfaForm = document.getElementById('mfaForm') as HTMLFormElement | null;
    const resendBtn = document.getElementById('resendBtn') as HTMLButtonElement | null;

    if (inlineForm && this.inlineSubmitHandler) inlineForm.removeEventListener('submit', this.inlineSubmitHandler);
    if (loginForm && this.modalLoginSubmitHandler) loginForm.removeEventListener('submit', this.modalLoginSubmitHandler);
    if (mfaForm && this.mfaSubmitHandler) mfaForm.removeEventListener('submit', this.mfaSubmitHandler);
    if (resendBtn && this.resendClickHandler) resendBtn.removeEventListener('click', this.resendClickHandler);

    if (this.otpIntervalId) {
      window.clearInterval(this.otpIntervalId);
      this.otpIntervalId = null;
    }
  }

  // -------------------------
  // Server-driven OTP helpers
  // -------------------------
  private async startOtpFlow(email: string): Promise<void> {
    // Call server endpoint to start OTP flow.
    // Expected server response: { ok: true, ttl: 60, resendLeft: 3, message: "Sent" }
    try {
      this.mfaInfo = 'Sending code...';
      this.updateMfaInfoElement();
      this.hideMfaError();

      const res = await fetch('/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const err = await this.safeJson(res).catch(() => ({ message: 'Unable to start authentication.' }));
        this.mfaError = err.message || 'Unable to start authentication.';
        this.updateMfaErrorElement();
        return;
      }

      const data = await res.json();
      const ttl = Number(data.ttl) || 60;
      this.resendLeft = Number(data.resendLeft) || 3;

      this.mfaInfo = `A code was sent to ${email}.`;
      this.updateMfaInfoElement();
      this.hideMfaError();

      this.startOtpCountdown(ttl);

      // Show MFA modal (Bootstrap)
      const mfaModalEl = document.getElementById('mfaModal');
      if (mfaModalEl && (window as any).bootstrap) {
        const bsModal = (window as any).bootstrap.Modal.getOrCreateInstance(mfaModalEl);
        bsModal.show();
        // focus the OTP input
        setTimeout(() => {
          const otpInput = document.getElementById('otpInput') as HTMLInputElement | null;
          otpInput && otpInput.focus();
        }, 200);
      }
    } catch (err) {
      this.mfaError = 'Network error. Please try again.';
      this.updateMfaErrorElement();
    }
  }

  private async resendOtp(email: string): Promise<void> {
    if (this.resendLeft <= 0) {
      this.mfaError = 'Resend limit reached. Please restart sign-in.';
      this.updateMfaErrorElement();
      return;
    }

    try {
      const res = await fetch('/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const err = await this.safeJson(res).catch(() => ({ message: 'Unable to resend code.' }));
        this.mfaError = err.message || 'Unable to resend code.';
        this.updateMfaErrorElement();
        return;
      }

      const data = await res.json();
      const ttl = Number(data.ttl) || 60;
      this.resendLeft = Number(data.resendLeft) || Math.max(0, this.resendLeft - 1);

      this.mfaInfo = `A new code was sent to ${email}. Resends left: ${this.resendLeft}`;
      this.updateMfaInfoElement();
      this.hideMfaError();

      this.startOtpCountdown(ttl);
    } catch (err) {
      this.mfaError = 'Network error. Please try again.';
      this.updateMfaErrorElement();
    }
  }

  private async verifyCode(email: string, code: string): Promise<void> {
    try {
      const res = await fetch('/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      if (!res.ok) {
        const err = await this.safeJson(res).catch(() => ({ message: 'Verification failed.' }));
        this.mfaError = err.message || 'Verification failed.';
        this.updateMfaErrorElement();
        return;
      }

      const data = await res.json();
      if (data.ok) {
        // Server should set secure cookie; client proceeds to complete sign-in flow
        this.completeSignIn();
      } else {
        this.mfaError = data.message || 'Incorrect code. Try again.';
        this.updateMfaErrorElement();
      }
    } catch (err) {
      this.mfaError = 'Network error. Please try again.';
      this.updateMfaErrorElement();
    }
  }

  private completeSignIn(): void {
    // Hide modals and show toast (Bootstrap)
    const mfaModalEl = document.getElementById('mfaModal');
    const loginModalEl = document.getElementById('loginModal');
    if (mfaModalEl && (window as any).bootstrap) {
      const bs = (window as any).bootstrap.Modal.getInstance(mfaModalEl);
      bs && bs.hide();
    }
    if (loginModalEl && (window as any).bootstrap) {
      const bs = (window as any).bootstrap.Modal.getInstance(loginModalEl);
      bs && bs.hide();
    }

    // Show toast
    const successToastInner = document.getElementById('successToastInner');
    if (successToastInner && (window as any).bootstrap) {
      const toast = new (window as any).bootstrap.Toast(successToastInner, { delay: 3000 });
      const body = successToastInner.querySelector('.toast-body');
      if (body) body.textContent = 'Signed in successfully';
      toast.show();
    }

    // Redirect after a short delay so toast is visible
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1200);
  }

  // -------------------------
  // Timer utilities
  // -------------------------
  private startOtpCountdown(ttlSeconds: number): void {
    if (this.otpIntervalId) {
      window.clearInterval(this.otpIntervalId);
      this.otpIntervalId = null;
    }
    this.otpExpiresAt = Date.now() + ttlSeconds * 1000;
    this.updateOtpTimerText();
    this.otpIntervalId = window.setInterval(() => this.updateOtpTimerText(), 500);
  }

  private updateOtpTimerText(): void {
    const remaining = Math.max(0, Math.floor((this.otpExpiresAt - Date.now()) / 1000));
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    this.otpTimerText = `${mm}:${ss}`;
    const otpTimerEl = document.getElementById('otpTimer');
    if (otpTimerEl) otpTimerEl.textContent = this.otpTimerText;

    if (remaining <= 0 && this.otpIntervalId) {
      window.clearInterval(this.otpIntervalId);
      this.otpIntervalId = null;
    }
  }

  // -------------------------
  // Small DOM update helpers
  // -------------------------
  private updateInlineErrorElement(): void {
    const el = document.getElementById('inlineError');
    if (!el) return;
    el.textContent = this.inlineError;
    if (this.inlineError) el.classList.add('visible');
    else el.classList.remove('visible');
  }

  private updateLoginErrorElement(): void {
    const el = document.getElementById('loginError');
    if (!el) return;
    el.textContent = this.loginError;
    if (this.loginError) el.classList.remove('d-none');
    else el.classList.add('d-none');
  }

  private updateMfaErrorElement(): void {
    const el = document.getElementById('mfaError');
    if (!el) return;
    el.textContent = this.mfaError;
    if (this.mfaError) el.classList.remove('d-none');
    else el.classList.add('d-none');
  }

  private hideMfaError(): void {
    this.mfaError = '';
    this.updateMfaErrorElement();
  }

  private updateMfaInfoElement(): void {
    const el = document.getElementById('mfaInfo');
    if (!el) return;
    el.textContent = this.mfaInfo;
  }

  // Safe JSON parse for non-OK responses
  private async safeJson(res: Response): Promise<any> {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
}