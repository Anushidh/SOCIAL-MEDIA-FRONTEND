import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { StoryGroup, Story } from '../../core/models';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AvatarComponent],
  templateUrl: './stories.component.html',
})
export class StoriesComponent implements OnInit {
  storyGroups: StoryGroup[] = [];
  loading = false;
  showUpload = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  caption = '';
  uploading = false;
  viewingStory: Story | null = null;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void { this.loadStories(); }

  loadStories(): void {
    this.loading = true;
    this.api.get<StoryGroup[]>('/stories/feed').subscribe({
      next: (groups) => { this.storyGroups = groups; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  uploadStory(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    if (this.caption) formData.append('caption', this.caption);

    this.api.postFormData<any>('/stories/upload', formData).subscribe({
      next: () => {
        this.showUpload = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.caption = '';
        this.uploading = false;
        this.toast.success('Story posted!');
        this.loadStories();
      },
      error: () => { this.uploading = false; this.toast.error('Failed to post story'); },
    });
  }

  viewStory(story: Story): void {
    this.viewingStory = story;
    this.api.post<void>(`/stories/${story.id}/view`, {}).subscribe();
  }

  closeStory(): void { this.viewingStory = null; }
}
