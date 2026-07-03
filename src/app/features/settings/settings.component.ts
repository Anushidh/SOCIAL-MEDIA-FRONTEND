import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AvatarComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  savingProfile = false;
  savingPassword = false;

  get currentUser() { return this.authService.currentUser; }

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const user = this.currentUser;
    this.profileForm = this.fb.group({
      displayName: [user?.displayName ?? '', [Validators.maxLength(50)]],
      bio: [user?.bio ?? '', [Validators.maxLength(160)]],
      isPrivate: [user?.isPrivate ?? false],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile = true;
    this.usersService.updateMe(this.profileForm.value).subscribe({
      next: (user) => {
        this.authService.updateCurrentUser(user);
        this.savingProfile = false;
        this.toast.success('Profile updated!');
      },
      error: () => { this.savingProfile = false; this.toast.error('Failed to save'); },
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.usersService.uploadAvatar(formData).subscribe({
      next: (res) => {
        const user = this.currentUser;
        if (user) {
          this.authService.updateCurrentUser({ ...user, avatarUrl: res.avatarUrl });
        }
        this.toast.success('Avatar updated!');
      },
      error: () => this.toast.error('Failed to upload avatar'),
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword = true;
    this.usersService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.savingPassword = false;
        this.toast.success('Password changed!');
      },
      error: (err) => {
        this.savingPassword = false;
        this.toast.error(err.error?.message ?? 'Failed to change password');
      },
    });
  }

  deactivate(): void {
    if (confirm('Deactivate your account? You can reactivate by logging in again.')) {
      this.usersService.deactivateMe().subscribe({
        next: () => this.authService.logout(),
        error: () => this.toast.error('Failed to deactivate'),
      });
    }
  }
}
