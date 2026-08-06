import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

export type AnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-in'
  | 'scale-up'
  | 'scale-down'
  | 'rotate-in'
  | 'blur-in';

@Directive({
  selector: '[scrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() scrollAnimate: AnimationType = 'fade-up';
  @Input() delay: number = 0;
  @Input() duration: number = 600;
  @Input() threshold: number = 0.15;

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const element = this.el.nativeElement;

    element.style.opacity = '0';
    element.style.transition = `opacity ${this.duration}ms ease ${this.delay}ms, transform ${this.duration}ms ease ${this.delay}ms`;

    switch (this.scrollAnimate) {
      case 'fade-up':
        element.style.transform = 'translateY(40px)';
        break;
      case 'fade-down':
        element.style.transform = 'translateY(-40px)';
        break;
      case 'fade-left':
        element.style.transform = 'translateX(40px)';
        break;
      case 'fade-right':
        element.style.transform = 'translateX(-40px)';
        break;
      case 'fade-in':
        break;
      case 'scale-up':
        element.style.transform = 'scale(0.9)';
        break;
      case 'scale-down':
        element.style.transform = 'scale(1.1)';
        break;
      case 'rotate-in':
        element.style.transform = 'rotate(-5deg) scale(0.95)';
        break;
      case 'blur-in':
        element.style.filter = 'blur(10px)';
        break;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.style.opacity = '1';
            element.style.transform = 'translate(0) scale(1) rotate(0)';
            element.style.filter = 'blur(0)';
            this.observer?.unobserve(element);
          }
        });
      },
      { threshold: this.threshold, rootMargin: '0px 0px -50px 0px' }
    );

    this.observer.observe(element);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
