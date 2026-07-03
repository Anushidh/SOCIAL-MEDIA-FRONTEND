import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit {
  form: ReturnType<FormBuilder['group']>;
  loading = false;
  resending = false;
  submitted = false;
  email = '';

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) {
      this.router.navigate(['/auth/register']);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.verifyEmail(this.email, this.f['otp'].value).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? 'Invalid or expired OTP');
      },
    });
  }

  resendOtp(): void {
    this.resending = true;
    this.authService.resendOtp(this.email).subscribe({
      next: (res) => {
        this.resending = false;
        this.toast.success(res.message);
      },
      error: () => {
        this.resending = false;
        this.toast.error('Failed to resend OTP');
      },
    });
  }
}
