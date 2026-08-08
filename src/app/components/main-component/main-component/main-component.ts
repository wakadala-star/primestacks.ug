import { Component, signal, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ScrollAnimateDirective } from '../../../directives/scroll-animate.directive';
import emailjs from '@emailjs/browser';

interface FAQ {
  question: string;
  answer: string;
}

interface Service {
  icon: string;
  title: string;
  description: string;
}

interface Project {
  title: string;
  category: string;
  description: string;
  image: string;
  tech: string[];
  demoUrl?: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

@Component({
  selector: 'main-component',
  imports: [CommonModule, ScrollAnimateDirective],
  templateUrl: './main-component.html',
  styleUrl: './main-component.css',
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
  private sanitizer = inject(DomSanitizer);

  @ViewChild('stepsGrid') stepsGrid!: ElementRef<HTMLElement>;
  @ViewChild('carouselSlider') carouselSlider!: ElementRef<HTMLUListElement>;

  protected readonly openFaqIndex = signal<number | null>(null);
  protected readonly typedCode = signal<string>('');
  protected readonly showCursor = signal<boolean>(true);
  protected readonly activeStep = signal<number>(-1);
  protected readonly animationComplete = signal<boolean>(false);
  protected readonly formSubmitting = signal<boolean>(false);
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly formError = signal<boolean>(false);
  protected readonly currentProjectIndex = signal<number>(0);

  private readonly fullCode = [
    '<span class="kw">const</span> <span class="fn">primeStacks</span> = &#123;',
    '  <span class="prop">mission</span>: <span class="str">"Build. Scale. Innovate."</span>,',
    '  <span class="prop">services</span>: [',
    '    <span class="str">"Custom Software"</span>,',
    '    <span class="str">"Web Apps"</span>,',
    '    <span class="str">"Mobile Apps"</span>,',
    '    <span class="str">"Cloud & DevOps"</span>',
    '  ],',
    '  <span class="fn">deliver</span>: () =&gt; &#123;',
    '    <span class="kw">return</span> <span class="str">"Excellence"</span>;',
    '  &#125;',
    '&#125;;'
  ];

  private loopCount = 0;
  private readonly maxLoops = 6;
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private cursorInterval: ReturnType<typeof setInterval> | null = null;
  private stepsObserver: IntersectionObserver | null = null;
  private stepSequenceTimeout: ReturnType<typeof setTimeout> | null = null;
  private hasStepAnimationStarted = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  ngOnInit() {
    this.startTypingAnimation();
    this.startCursorBlink();
  }

  ngAfterViewInit() {
    this.initStepsObserver();
    this.scrollToActiveSlide();
    this.setupCarouselKeyboard();
  }

  ngOnDestroy() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
    if (this.stepsObserver) {
      this.stepsObserver.disconnect();
    }
    if (this.stepSequenceTimeout) {
      clearTimeout(this.stepSequenceTimeout);
    }
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }

  private startCursorBlink() {
    this.cursorInterval = setInterval(() => {
      this.showCursor.update(v => !v);
    }, 530);
  }

  private startTypingAnimation() {
    this.typeCode(0, 0);
  }

  private typeCode(lineIndex: number, charIndex: number) {
    if (this.loopCount >= this.maxLoops) {
      this.typedCode.set(this.fullCode.join('\n'));
      return;
    }

    if (lineIndex >= this.fullCode.length) {
      this.loopCount++;
      if (this.loopCount < this.maxLoops) {
        this.typingTimeout = setTimeout(() => {
          this.typedCode.set('');
          this.typeCode(0, 0);
        }, 5000);
      }
      return;
    }

    const currentLine = this.fullCode[lineIndex];

    if (charIndex < currentLine.length) {
      const partialLine = currentLine.substring(0, charIndex + 1);
      const lines = this.fullCode.slice(0, lineIndex);
      lines.push(partialLine);
      this.typedCode.set(lines.join('\n'));

      const delay = this.getTypingDelay(currentLine, charIndex);
      this.typingTimeout = setTimeout(() => {
        this.typeCode(lineIndex, charIndex + 1);
      }, delay);
    } else {
      this.typingTimeout = setTimeout(() => {
        this.typeCode(lineIndex + 1, 0);
      }, 150);
    }
  }

  private getTypingDelay(line: string, charIndex: number): number {
    const char = line[charIndex];
    if (char === '{' || char === '}' || char === '[' || char === ']') {
      return 120;
    }
    if (char === ',' || char === ';') {
      return 100;
    }
    if (char === ' ') {
      return 30;
    }
    return 55;
  }

  protected nextProject() {
    const total = this.projects.length;
    if (this.currentProjectIndex() < total - 1) {
      this.currentProjectIndex.update(i => i + 1);
      this.scrollToActiveSlide();
    }
  }

  protected prevProject() {
    if (this.currentProjectIndex() > 0) {
      this.currentProjectIndex.update(i => i - 1);
      this.scrollToActiveSlide();
    }
  }

  protected setActiveProject(index: number) {
    this.currentProjectIndex.set(index);
    this.scrollToActiveSlide();
  }

  private scrollToActiveSlide() {
    setTimeout(() => {
      const slider = this.carouselSlider?.nativeElement;
      if (!slider) return;
      const activeSlide = slider.querySelector('.carousel__slide.active') as HTMLElement;
      if (!activeSlide) return;
      const { offsetLeft, offsetWidth } = activeSlide;
      const { clientWidth } = slider;
      slider.scrollTo({
        left: offsetLeft - clientWidth / 2 + offsetWidth / 2,
        behavior: 'smooth'
      });
    });
  }

  private setupCarouselKeyboard() {
    this.keydownHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.carousel__slider')) return;
      const total = this.projects.length;
      const idx = this.currentProjectIndex();
      if (e.key === 'ArrowLeft' && idx > 0) {
        e.preventDefault();
        this.currentProjectIndex.update(i => i - 1);
        this.scrollToActiveSlide();
      } else if (e.key === 'ArrowRight' && idx < total - 1) {
        e.preventDefault();
        this.currentProjectIndex.update(i => i + 1);
        this.scrollToActiveSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.currentProjectIndex.set(0);
        this.scrollToActiveSlide();
      } else if (e.key === 'End') {
        e.preventDefault();
        this.currentProjectIndex.set(total - 1);
        this.scrollToActiveSlide();
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  protected readonly services: Service[] = [
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/><path d="M7 12l3 3 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      title: 'Custom Software Development',
      description:
        'Tailored solutions built from the ground up to solve your unique business challenges with scalable, maintainable code.',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
      title: 'Web Application Development',
      description:
        'Modern, responsive web applications using cutting-edge frameworks like Angular, React, and Next.js for exceptional user experiences.',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/><path d="M8 6h8M8 10h8M8 14h4"/></svg>',
      title: 'Mobile App Development',
      description:
        'Native and cross-platform mobile applications for iOS and Android that deliver seamless performance on every device.',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/><path d="M12 13v4m-2-2h4"/></svg>',
      title: 'Cloud & DevOps',
      description:
        'Cloud infrastructure setup, CI/CD pipelines, and deployment automation to keep your applications running smoothly at scale.',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      title: 'UI/UX Design',
      description:
        'User-centered design that transforms complex workflows into intuitive, beautiful interfaces your customers will love.',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      title: 'API Development & Integration',
      description:
        'Robust RESTful and GraphQL APIs that connect your systems, streamline data flow, and power your digital ecosystem.',
    },
  ];

  protected readonly projects: Project[] = [
    {
      title: 'Express Go Chat App',
      category: 'Full-Stack',
      description:
        'A full-stack real-time chat platform with a clean, responsive WhatsApp/Telegram-inspired UI. Built with Angular 22 on the frontend and powered by Express.js and Go for high-performance messaging.',
      image: 'express-go-chat.png',
      tech: ['Angular 22', 'TypeScript 6', 'SCSS', 'Go', 'PostgreSQL', 'Socket.io'],
      demoUrl: 'https://wakadala-star.github.io/Express_Go_chatApp/',
    },
    {
      title: 'FinTrack Pro',
      category: 'Fintech',
      description:
        'A comprehensive financial tracking platform with real-time analytics, portfolio management, and automated reporting for institutional investors. The platform provides deep insights into market trends and enables data-driven investment decisions.',
      image: 'https://picsum.photos/seed/fintrack/1200/600',
      tech: ['Angular', 'Node.js', 'PostgreSQL', 'AWS'],
    },
    {
      title: 'MediConnect',
      category: 'Healthcare',
      description:
        'Telemedicine platform connecting patients with healthcare providers through secure video consultations and digital prescription management. Features include appointment scheduling, medical records access, and real-time health monitoring.',
      image: 'https://picsum.photos/seed/mediconnect/1200/600',
      tech: ['React', 'Python', 'MongoDB', 'WebRTC'],
    },
    {
      title: 'LogiFlow',
      category: 'Logistics',
      description:
        'Supply chain management system with real-time shipment tracking, route optimization, and predictive delivery analytics. The platform integrates with major carriers and provides end-to-end visibility across the entire logistics network.',
      image: 'https://picsum.photos/seed/logiflow/1200/600',
      tech: ['Angular', 'Go', 'Redis', 'Docker'],
    },
    {
      title: 'EduSphere',
      category: 'EdTech',
      description:
        'Interactive learning management system with live classrooms, progress tracking, and AI-powered personalized learning paths. Supports multimedia content, quizzes, and collaborative projects for an engaging educational experience.',
      image: 'https://picsum.photos/seed/edusphere/1200/600',
      tech: ['Next.js', 'TypeScript', 'Prisma', 'Vercel'],
    },
  ];

  protected readonly pricingPlans: PricingPlan[] = [
    {
      name: 'Starter',
      price: '$4,999',
      period: 'per project',
      description: 'Perfect for startups and small businesses launching their first digital product.',
      features: [
        'Up to 5 pages/screens',
        'Responsive design',
        'Basic API integration',
        '3 months support',
        'Source code ownership',
      ],
      highlighted: false,
      cta: 'Get Started',
    },
    {
      name: 'Professional',
      price: '$14,999',
      period: 'per project',
      description: 'For growing businesses that need a robust, scalable application with advanced features.',
      features: [
        'Up to 20 pages/screens',
        'Custom UI/UX design',
        'Advanced API & third-party integrations',
        'Database architecture',
        '6 months support',
        'Performance optimization',
        'Source code ownership',
      ],
      highlighted: true,
      cta: 'Get Started',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored to you',
      description: 'Full-scale solutions for large organizations with complex requirements and tight deadlines.',
      features: [
        'Unlimited pages/screens',
        'Dedicated project manager',
        'Microservices architecture',
        'Cloud infrastructure setup',
        'CI/CD pipeline',
        '12 months support',
        'SLA guarantee',
        'Source code ownership',
      ],
      highlighted: false,
      cta: 'Contact Sales',
    },
  ];

  protected readonly faqs: FAQ[] = [
    {
      question: 'What technologies does PrimeStacks specialize in?',
      answer:
        'We work with a wide range of modern technologies including Angular, React, Next.js, Node.js, Python, Go, and cloud platforms like AWS, Azure, and GCP. We choose the best stack for each project based on your specific requirements.',
    },
    {
      question: 'How long does a typical project take?',
      answer:
        'Project timelines vary based on complexity. A simple web application typically takes 6-8 weeks, while a complex enterprise solution may take 3-6 months. We provide a detailed timeline during our initial consultation and keep you updated throughout the development process.',
    },
    {
      question: 'Do you provide ongoing maintenance and support?',
      answer:
        'Yes. Every project includes a support period (3-12 months depending on your plan) that covers bug fixes, minor updates, and technical support. After the included period, we offer affordable monthly maintenance packages to keep your application running smoothly.',
    },
    {
      question: 'Can I hire PrimeStacks for just UI/UX design?',
      answer:
        'Absolutely. While we excel at end-to-end development, we also offer standalone UI/UX design services. Our design team will create wireframes, prototypes, and high-fidelity designs that align with your brand and user needs.',
    },
    {
      question: 'How do you ensure code quality?',
      answer:
        'We follow industry best practices including code reviews, automated testing (unit, integration, and end-to-end), CI/CD pipelines, and adherence to clean architecture principles. Every line of code is reviewed before it reaches production.',
    },
    {
      question: 'What is your pricing model?',
      answer:
        'We offer both fixed-price and time-and-materials billing. For well-defined projects with clear requirements, we recommend fixed-price. For ongoing or evolving projects, time-and-materials gives you the flexibility to adapt as needs change.',
    },
  ];

  protected toggleFaq(index: number) {
    this.openFaqIndex.set(this.openFaqIndex() === index ? null : index);
  }

  protected isFaqOpen(index: number): boolean {
    return this.openFaqIndex() === index;
  }

  protected sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  protected async sendEmail(e: Event) {
    e.preventDefault();
    this.formSubmitting.set(true);
    this.formError.set(false);
    this.formSubmitted.set(false);

    const form = e.target as HTMLFormElement;
    const templateParams = {
      from_name: form['from_name'].value,
      from_email: form['from_email'].value,
      subject: form['subject'].value,
      message: form['message'].value,
    };

    try {
      await emailjs.send(
        'service_11z1fsm',
        'template_7eqdyh7',
        templateParams,
        'pw9wXjneKOmuNm1sF'
      );
      this.formSubmitted.set(true);
      form.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      this.formError.set(true);
    } finally {
      this.formSubmitting.set(false);
    }
  }

  private initStepsObserver() {
    if (!this.stepsGrid?.nativeElement) return;

    this.stepsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasStepAnimationStarted) {
            this.hasStepAnimationStarted = true;
            this.startStepSequence();
          }
        });
      },
      { threshold: 0.3 }
    );

    this.stepsObserver.observe(this.stepsGrid.nativeElement);
  }

  private startStepSequence() {
    const totalSteps = 4;
    const stepDuration = 2000;
    const finalStepDuration = 4000;

    const animateStep = (step: number) => {
      if (step >= totalSteps) {
        return;
      }

      this.activeStep.set(step);

      const duration = step === totalSteps - 1 ? finalStepDuration : stepDuration;

      this.stepSequenceTimeout = setTimeout(() => {
        if (step === totalSteps - 1) {
          this.animationComplete.set(true);
        } else {
          animateStep(step + 1);
        }
      }, duration);
    };

    animateStep(0);
  }
}
