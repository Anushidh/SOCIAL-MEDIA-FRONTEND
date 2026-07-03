import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  templateUrl: './oauth-callback.component.html',
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.authService.handleOAuthToken(token);

    this.usersService.getMe().subscribe({
      next: (user) => {
        this.authService.updateCurrentUser(user);
        this.router.navigate(['/feed']);
      },
      error: () => {
        this.authService.logout();
      },
    });
  }
}
