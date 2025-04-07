import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-logout',
  template: `
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
      <div class="text-center">
        <app-loading-spinner [size]="'lg'" [color]="'primary'" [fullWidth]="true"></app-loading-spinner>
        <p class="mt-4 text-gray-600">Logging you out...</p>
      </div>
    </div>
  `,
  styles: [`
    .min-h-screen {
      min-height: 100vh;
    }
    .bg-gray-100 {
      background-color: #f3f4f6;
    }
    .flex {
      display: flex;
    }
    .justify-center {
      justify-content: center;
    }
    .items-center {
      align-items: center;
    }
    .text-center {
      text-align: center;
    }
    .mt-4 {
      margin-top: 1rem;
    }
    .text-gray-600 {
      color: #4b5563;
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
    this.authService.logout().subscribe({
      next: () => {
        this.toastr.success('You have been successfully logged out');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1000);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.toastr.error('There was a problem logging out');
        this.router.navigate(['/dashboard']);
      }
    });
  }
} 