import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Register as a Citizen</h2>
        <p class="text-center text-gray-600 mb-6">
          Create an account to report crimes and track your cases
        </p>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="firstName">
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="firstName"
                type="text"
                name="firstName"
                [(ngModel)]="registerData.firstName"
                required
                minlength="2"
                #firstName="ngModel"
              >
              <div *ngIf="firstName.invalid && (firstName.dirty || firstName.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="firstName.errors?.['required']">First name is required</div>
                <div *ngIf="firstName.errors?.['minlength']">First name must be at least 2 characters</div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="lastName">
                Last Name <span class="text-red-500">*</span>
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="lastName"
                type="text"
                name="lastName"
                [(ngModel)]="registerData.lastName"
                required
                minlength="2"
                #lastName="ngModel"
              >
              <div *ngIf="lastName.invalid && (lastName.dirty || lastName.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="lastName.errors?.['required']">Last name is required</div>
                <div *ngIf="lastName.errors?.['minlength']">Last name must be at least 2 characters</div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="username">
              Username <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="username"
              type="text"
              name="username"
              [(ngModel)]="registerData.username"
              required
              minlength="3"
              #username="ngModel"
            >
            <div *ngIf="username.invalid && (username.dirty || username.touched)" class="text-xs text-red-500 mt-1">
              <div *ngIf="username.errors?.['required']">Username is required</div>
              <div *ngIf="username.errors?.['minlength']">Username must be at least 3 characters</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="email">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="email"
              type="email"
              name="email"
              [(ngModel)]="registerData.email"
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              #email="ngModel"
            >
            <div *ngIf="email.invalid && (email.dirty || email.touched)" class="text-xs text-red-500 mt-1">
              <div *ngIf="email.errors?.['required']">Email is required</div>
              <div *ngIf="email.errors?.['pattern']">Please enter a valid email</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="phoneNumber">
              Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              [(ngModel)]="registerData.phoneNumber"
              required
              pattern="^\\+?[1-9]\\d{1,14}$"
              placeholder="+1234567890"
              #phone="ngModel"
            >
            <div *ngIf="phone.invalid && (phone.dirty || phone.touched)" class="text-xs text-red-500 mt-1">
              <div *ngIf="phone.errors?.['required']">Phone number is required</div>
              <div *ngIf="phone.errors?.['pattern']">Please enter a valid phone number</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="address">
              Address
            </label>
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="address"
              type="text"
              name="address"
              [(ngModel)]="registerData.address"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="password">
              Password <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                name="password"
                [(ngModel)]="registerData.password"
                required
                minlength="8"
                pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$"
                #password="ngModel"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                (click)="togglePasswordVisibility()"
              >
                <svg *ngIf="!showPassword" class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg *ngIf="showPassword" class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21"></path>
                </svg>
              </button>
            </div>
            <div *ngIf="password.invalid && (password.dirty || password.touched)" class="text-xs text-red-500 mt-1">
              <div *ngIf="password.errors?.['required']">Password is required</div>
              <div *ngIf="password.errors?.['minlength']">Password must be at least 8 characters</div>
              <div *ngIf="password.errors?.['pattern']">Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character</div>
            </div>
          </div>

          <div class="flex items-center">
            <input
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              id="enableMfa"
              type="checkbox"
              name="enableMfa"
              [(ngModel)]="registerData.enableMfa"
            >
            <label class="ml-2 block text-sm text-gray-900" for="enableMfa">
              Enable Two-Factor Authentication
            </label>
          </div>

          <div class="flex justify-between pt-4">
            <button
              class="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              [disabled]="!registerForm.form.valid"
            >
              Register
            </button>
          </div>

          <div class="text-center mt-4">
            <a class="text-sm text-blue-500 hover:text-blue-800" routerLink="/auth/login">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    role: UserRole.CITIZEN,
    enableMfa: false
  };
  showPassword = false; // New property to track password visibility

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        if (response.mfaRequired) {
          this.toastr.success('Registration successful. Please complete the two-factor authentication setup.');
          this.router.navigate(['/auth/setup-mfa'], { queryParams: { email: this.registerData.email } });
        } else {
          this.toastr.success('Registration successful. Please login to continue.');
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.toastr.error(error.message || 'Registration failed. Please check your information and try again.');
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
