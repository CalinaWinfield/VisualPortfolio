import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-mfa-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mfa-enrollment.component.html',
  styleUrls: ['./mfa-enrollment.component.css']
})
export class MfaEnrollmentComponent implements OnInit {

  userId!: string;
  qrCodeImage: string | null = null;
  code: string = '';
  loading = true;
  error: string | null = null;
  verifying = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  loadQrCode() {
  this.loading = true;

  this.auth.getMfaSetup(this.userId).subscribe({
    next: (res: any) => {
      this.qrCodeImage = res.qrCode;
      this.loading = false;
    },
    error: (err: any) => {
      console.error("Error loading QR code:", err);
      this.error = "Failed to load MFA setup.";
      this.loading = false;
    }
  });
}

  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    this.userId = params['userId'];
    console.log("USER ID FROM QUERY PARAMS:", this.userId);

    if (!this.userId) {
      this.error = "Missing user ID for MFA enrollment.";
      return;
    }

    this.loadQrCode();
  });
}

  submitCode() {
  this.verifying = true;
  this.error = null;

  this.auth.verifyMfaSetup(this.userId, this.code).subscribe({
    next: (res: any) => {
      this.verifying = false;

      // ⭐ Store the real access token returned after MFA setup
      this.auth.setAccessToken(res.accessToken);

      this.router.navigate(['/dashboard']);
    },
    error: () => {
      this.verifying = false;
      this.error = "Invalid code. Try again.";
    }
  });
}
}