import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  form: ReturnType<FormBuilder['group']>;
  token: string | null = null;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({ newPassword: ['', [Validators.required, Validators.minLength(8)]] });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || !this.token) return;
    this.loading = true;
    this.authService.resetPassword(this.token, this.form.value.newPassword!).subscribe({
      next: () => {
        this.toast.success('Password reset! Please sign in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? 'Reset failed');
      },
    });
  }
}
