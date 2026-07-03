import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: ':username',
    loadComponent: () =>
      import('./profile.component').then((m) => m.ProfileComponent),
  },
];
