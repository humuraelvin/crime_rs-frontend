import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div [ngClass]="spinnerClasses">
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" [attr.stroke]="color" stroke-width="4"></circle>
        <path class="opacity-75" [attr.fill]="color" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span *ngIf="text" class="ml-3 text-sm" [ngClass]="textColorClass">{{ text }}</span>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    .spinner-sm {
      width: 1rem;
      height: 1rem;
    }
    
    .spinner-md {
      width: 1.5rem;
      height: 1.5rem;
    }
    
    .spinner-lg {
      width: 2rem;
      height: 2rem;
    }
    
    .spinner-xl {
      width: 3rem;
      height: 3rem;
    }
    
    .spinner-container {
      display: inline-flex;
      align-items: center;
    }
    
    .spinner-container-full-width {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 2rem 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: string = '#6366F1'; // indigo-500
  @Input() text: string = '';
  @Input() fullWidth: boolean = false;

  get spinnerClasses(): string {
    const classes = ['spinner-container'];
    
    if (this.fullWidth) {
      classes.push('spinner-container-full-width');
    }
    
    return classes.join(' ');
  }

  get spinnerSizeClass(): string {
    return `spinner-${this.size}`;
  }
  
  get textColorClass(): string {
    return this.color === '#FFFFFF' || this.color === 'white' ? 'text-white' : 'text-gray-700';
  }
} 