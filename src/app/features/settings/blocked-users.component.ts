import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-blocked-users',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent],
  templateUrl: './blocked-users.component.html',
})
export class BlockedUsersComponent implements OnInit {
  blockedUsers: any[] = [];
  blockedLoading = true;

  constructor(
    private usersService: UsersService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBlockedUsers();
  }

  loadBlockedUsers(): void {
    this.blockedLoading = true;
    this.usersService.getBlockedUsers().subscribe({
      next: (res) => {
        this.blockedUsers = res.data;
        this.blockedLoading = false;
      },
      error: () => this.blockedLoading = false
    });
  }

  unblockUser(userId: string): void {
    this.usersService.unblockUser(userId).subscribe({
      next: () => {
        this.blockedUsers = this.blockedUsers.filter(b => b.blockedId !== userId);
        this.toast.success('User unblocked');
      },
      error: () => this.toast.error('Failed to unblock user')
    });
  }
}
