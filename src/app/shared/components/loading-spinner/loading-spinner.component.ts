import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngClass]="getSizeClass()">
      <div class="animate-spin rounded-full border-t-2 border-b-2" 
           [ngClass]="getSpinnerClass()">
      </div>
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';

  getSizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      default:
        return 'h-6 w-6';
    }
  }

  getSpinnerClass(): string {
    const baseClasses = 'h-full w-full';
    switch (this.color) {
      case 'secondary':
        return `${baseClasses} border-gray-600`;
      case 'white':
        return `${baseClasses} border-white`;
      default:
        return `${baseClasses} border-blue-600`;
    }
  }
} 