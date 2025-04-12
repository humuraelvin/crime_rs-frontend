import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
      <div class="text-center">
        <app-loading-spinner [size]="'lg'" [color]="'primary'" [fullWidth]="true"></app-loading-spinner>
        <p class="mt-4 text-gray-600">Logging you out...</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class LogoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    try {
      // Call the logout method directly since it handles navigation
      this.authService.logout();
      
      // Show success message
      this.toastr.success('You have been successfully logged out');
      
      // Give a slight delay for the spinner to be visible, then force navigation
      setTimeout(() => {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      this.toastr.error('There was a problem logging out');
      this.router.navigate(['/dashboard']);
    }
  }
} 