import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signUp.component.html'
})
export class SignUpComponent {
  form: FormGroup;
  loading = false;

  showPassword = false;          // <‑‑ add this
  showConfirmPassword = false;   // <‑‑ and this


  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {

    
    this.form = this.fb.group(
      {
        name: ['', Validators.required],

        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(/^[\w.-]+@ggc\.edu$/)   // enforce @ggc.edu
          ]
        ],

        password: ['', [Validators.required, Validators.minLength(6)]],

        confirmPassword: ['', Validators.required]     // required for matching
      },
      { validators: this.passwordsMatchValidator }     // attach validator
    );
  }

  
  passwordsMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    return password === confirm ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.auth.signup(this.form.value).subscribe({
      next: (res: any) => {
    console.log("Signup response:", res);

    const userId = res.userId;
    if (!userId) {
      console.error("Signup succeeded but no userId returned!");
      this.loading = false;
      alert("Signup error: missing user ID.");
      return;
    }

  this.auth.setAccessToken(res.accessToken);

  this.router.navigate(['/enroll-mfa'], {
    state: { userId }
  });
},
      error: (err: any) => {
        this.loading = false;
        alert(err?.error?.error || 'Signup failed');
      }
    });
  }
}