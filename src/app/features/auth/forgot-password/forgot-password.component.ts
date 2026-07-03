import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  form: ReturnType<FormBuilder['group']>;
  loading = false;
  submitted = false;
  sent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: () => { this.sent = true; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Something went wrong'); },
    });
  }
}
