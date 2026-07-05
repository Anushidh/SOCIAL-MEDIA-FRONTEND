import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
})
export class AvatarComponent {
  @Input() url?: string | null;
  @Input() name?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get safeName(): string { return this.name ?? ''; }

  get sizeClass(): string {
    const map = { xs: 'w-6 h-6', sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12', xl: 'w-16 h-16' };
    return map[this.size];
  }

  get textClass(): string {
    const map = { xs: 'text-xs', sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-xl' };
    return map[this.size];
  }

  /** Pixel dimension for NgOptimizedImage width/height (always square). */
  get pixelSize(): number {
    const map = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };
    return map[this.size];
  }
}
