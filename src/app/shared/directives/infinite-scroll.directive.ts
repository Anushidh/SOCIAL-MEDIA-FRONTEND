import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

/**
 * Emits `scrolled` when the host element enters the viewport.
 * Attach to a sentinel div at the bottom of a list to trigger infinite scroll.
 *
 * Usage:
 *   <div appInfiniteScroll (scrolled)="loadMore()" [threshold]="0.1"></div>
 */
@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  /** 0–1 ratio of the sentinel that must be visible to fire. Default 0.1 (10%). */
  @Input() threshold = 0.1;

  /** Emits when the sentinel becomes visible. */
  @Output() scrolled = new EventEmitter<void>();

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          this.scrolled.emit();
        }
      },
      { threshold: this.threshold },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
