import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostsService } from '../../../core/services/posts.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.component.html',
})
export class CreatePostComponent implements OnDestroy {
  form: ReturnType<FormBuilder['group']>;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading = false;
  submitted = false;

  readonly MAX_IMAGES = 10;
  readonly MAX_SIZE_MB = 5;

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private postsService: PostsService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    const combined = [...this.selectedFiles, ...newFiles];

    if (combined.length > this.MAX_IMAGES) {
      this.toast.error(`Maximum ${this.MAX_IMAGES} images allowed`);
      return;
    }

    for (const file of newFiles) {
      if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
        this.toast.error(`${file.name} exceeds ${this.MAX_SIZE_MB}MB limit`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.toast.error('Only image files are allowed');
        return;
      }
    }

    this.selectedFiles = combined;

    // Generate previews for new files
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrls.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.uploading = true;

    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('content', this.f['content'].value);
      this.selectedFiles.forEach((file) => formData.append('images', file));

      this.postsService.createWithImages(formData).subscribe({
        next: () => {
          this.toast.success('Post created!');
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          this.uploading = false;
          this.toast.error(err.error?.message ?? 'Failed to create post');
        },
      });
    } else {
      this.postsService.create({ content: this.f['content'].value }).subscribe({
        next: () => {
          this.toast.success('Post created!');
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          this.uploading = false;
          this.toast.error(err.error?.message ?? 'Failed to create post');
        },
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up object URLs if any were created
  }
}
