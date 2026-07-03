import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup;
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message ?? 'Login failed');
      },
    });
  }
}
