import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center">
      <div
        [ngClass]="getSpinnerClasses()"
        class="inline-block animate-spin rounded-full border-t-transparent border-solid"
        role="status"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `,
  styles: [],
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';

  getSpinnerClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-4',
      lg: 'w-12 h-12 border-4',
      xl: 'w-16 h-16 border-4',
    };

    const colorClasses = {
      primary: 'border-blue-600',
      secondary: 'border-gray-600',
      white: 'border-white',
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }
} 