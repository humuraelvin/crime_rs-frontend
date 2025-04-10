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
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="password"
              type="password"
              name="password"
              [(ngModel)]="registerData.password"
              required
              minlength="8"
              pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$"
              #password="ngModel"
            >
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
} 