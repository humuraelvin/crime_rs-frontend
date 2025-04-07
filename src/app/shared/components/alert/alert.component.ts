import { Component, Input, Output, EventEmitter } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Output() dismissed = new EventEmitter<void>();

  get iconName(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  get alertClass(): string {
    switch (this.type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-400';
      case 'error': return 'bg-red-50 text-red-800 border-red-400';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-400';
      default: return 'bg-blue-50 text-blue-800 border-blue-400';
    }
  }
  
  get iconClass(): string {
    switch (this.type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  }

  dismiss(): void {
    this.dismissed.emit();
  }
} 