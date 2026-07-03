import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../../core/services/posts.service';
import { ToastService } from '../../../core/services/toast.service';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'violence', label: 'Violence' },
  { value: 'nudity', label: 'Nudity or sexual content' },
  { value: 'false_information', label: 'False information' },
  { value: 'other', label: 'Other' },
];

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-modal.component.html',
})
export class ReportModalComponent {
  @Input() entityId!: string;
  @Input() entityType = 'post';
  @Output() close = new EventEmitter<void>();

  reasons = REASONS;
  selectedReason = '';
  description = '';
  submitting = false;

  constructor(private postsService: PostsService, private toast: ToastService) {}

  submit(): void {
    if (!this.selectedReason) return;
    this.submitting = true;
    this.postsService.reportPost(
      this.entityId,
      this.entityType,
      this.selectedReason,
      this.description || undefined,
    ).subscribe({
      next: () => {
        this.toast.success('Report submitted. Thank you.');
        this.close.emit();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error(err.error?.message ?? 'Failed to submit report');
      },
    });
  }
}
