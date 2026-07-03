import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface Preferences {
  likeEnabled: boolean;
  commentEnabled: boolean;
  followEnabled: boolean;
  messageEnabled: boolean;
  mentionEnabled: boolean;
}

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-preferences.component.html',
})
export class NotificationPreferencesComponent implements OnInit {
  prefs: Preferences | null = null;
  loading = false;

  prefItems = [
    { key: 'likeEnabled' as keyof Preferences, label: 'Likes', description: 'When someone likes your post' },
    { key: 'commentEnabled' as keyof Preferences, label: 'Comments', description: 'When someone comments on your post' },
    { key: 'followEnabled' as keyof Preferences, label: 'Follows', description: 'When someone follows you' },
    { key: 'messageEnabled' as keyof Preferences, label: 'Messages', description: 'When you receive a new message' },
    { key: 'mentionEnabled' as keyof Preferences, label: 'Mentions', description: 'When someone mentions you' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.get<Preferences>('/notifications/preferences').subscribe({
      next: (prefs) => { this.prefs = prefs; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  toggle(key: keyof Preferences): void {
    if (!this.prefs) return;
    const newValue = !this.prefs[key];
    this.prefs = { ...this.prefs, [key]: newValue };
    this.api.patch('/notifications/preferences', { [key]: newValue }).subscribe({
      next: () => this.toast.success('Preferences saved'),
      error: () => {
        // Revert on error
        this.prefs = { ...this.prefs!, [key]: !newValue };
        this.toast.error('Failed to save');
      },
    });
  }
}
