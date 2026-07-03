import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info'): void {
    const id = crypto.randomUUID();
    this.toasts.update((t) => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), 3500);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  remove(id: string): void {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
