import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  form: ReturnType<FormBuilder['group']>;
  loading = false;
  submitted = false;
  googleAuthUrl = `${environment.apiUrl.replace('/api', '')}/api/auth/google`;
  facebookAuthUrl = `${environment.apiUrl.replace('/api', '')}/api/auth/facebook`;

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.register(this.form.value as any).subscribe({
      next: () => {
        // Registration just sends OTP — redirect to verify-email page
        this.router.navigate(['/auth/verify-email'], {
          queryParams: { email: this.form.value.email },
        });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? 'Registration failed');
      },
    });
  }
}
