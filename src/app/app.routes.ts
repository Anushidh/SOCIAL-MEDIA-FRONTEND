import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const routes: Routes = [
  // ─── Auth (public) ──────────────────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      {
        // OAuth redirect landing — must be public (no guard)
        path: 'oauth-callback',
        loadComponent: () =>
          import('./features/auth/oauth-callback/oauth-callback.component').then(
            (m) => m.OAuthCallbackComponent,
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ─── App (protected) ────────────────────────────────────────────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Feed & Explore
      {
        path: 'feed',
        loadComponent: () =>
          import('./features/feed/feed.component').then((m) => m.FeedComponent),
      },

      // Post detail
      {
        path: 'post/:id',
        loadComponent: () =>
          import('./features/post/post-detail/post-detail.component').then(
            (m) => m.PostDetailComponent,
          ),
      },
      {
        path: 'post/create',
        loadComponent: () =>
          import('./features/post/create-post/create-post.component').then(
            (m) => m.CreatePostComponent,
          ),
      },

      // Profile
      {
        path: 'profile/:username',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/:username/followers',
        loadComponent: () =>
          import('./features/profile/followers.component').then((m) => m.FollowersComponent),
      },
      {
        path: 'profile/:username/following',
        loadComponent: () =>
          import('./features/profile/followers.component').then((m) => m.FollowersComponent),
      },

      // Social
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component').then(
            (m) => m.NotificationsComponent,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/messages/messages.component').then((m) => m.MessagesComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search.component').then((m) => m.SearchComponent),
      },

      // Content discovery
      {
        path: 'bookmarks',
        loadComponent: () =>
          import('./features/bookmarks/bookmarks.component').then((m) => m.BookmarksComponent),
      },
      {
        path: 'stories',
        loadComponent: () =>
          import('./features/stories/stories.component').then((m) => m.StoriesComponent),
      },
      {
        path: 'hashtag/:name',
        loadComponent: () =>
          import('./features/hashtag/hashtag.component').then((m) => m.HashtagComponent),
      },

      // Settings
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'settings/notifications',
        loadComponent: () =>
          import('./features/settings/notification-preferences.component').then(
            (m) => m.NotificationPreferencesComponent,
          ),
      },
      {
        path: 'settings/blocked-users',
        loadComponent: () =>
          import('./features/settings/blocked-users.component').then(
            (m) => m.BlockedUsersComponent,
          ),
      },

      { path: '', redirectTo: 'feed', pathMatch: 'full' },
    ],
  },

  { path: '**', loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
