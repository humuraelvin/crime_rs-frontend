import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center">
      <div class="spinner" [ngClass]="sizeClasses">
        <div class="bounce1" [ngStyle]="{ 'background-color': colorClass }"></div>
        <div class="bounce2" [ngStyle]="{ 'background-color': colorClass }"></div>
        <div class="bounce3" [ngStyle]="{ 'background-color': colorClass }"></div>
      </div>
    </div>
  `,
  styles: [`
    .spinner {
      text-align: center;
    }
    
    .spinner > div {
      width: 18px;
      height: 18px;
      border-radius: 100%;
      display: inline-block;
      -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
      animation: sk-bouncedelay 1.4s infinite ease-in-out both;
      margin: 0 3px;
    }
    
    .spinner.sm > div {
      width: 10px;
      height: 10px;
    }
    
    .spinner.md > div {
      width: 14px;
      height: 14px;
    }
    
    .spinner.lg > div {
      width: 24px;
      height: 24px;
    }
    
    .spinner .bounce1 {
      -webkit-animation-delay: -0.32s;
      animation-delay: -0.32s;
    }
    
    .spinner .bounce2 {
      -webkit-animation-delay: -0.16s;
      animation-delay: -0.16s;
    }
    
    @-webkit-keyframes sk-bouncedelay {
      0%, 80%, 100% { -webkit-transform: scale(0) }
      40% { -webkit-transform: scale(1.0) }
    }
    
    @keyframes sk-bouncedelay {
      0%, 80%, 100% { 
        -webkit-transform: scale(0);
        transform: scale(0);
      } 40% { 
        -webkit-transform: scale(1.0);
        transform: scale(1.0);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  
  get sizeClasses(): string {
    return this.size;
  }
  
  get colorClass(): string {
    switch (this.color) {
      case 'primary':
        return '#3B82F6'; // blue-500
      case 'secondary':
        return '#6B7280'; // gray-500
      case 'white':
        return '#FFFFFF';
      default:
        return '#3B82F6';
    }
  }
} 