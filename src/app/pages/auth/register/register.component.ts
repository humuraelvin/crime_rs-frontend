import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../../../core/models/user.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div class="max-w-lg w-full p-8 bg-white rounded-xl shadow-md">
        <h2 class="text-3xl font-semibold text-center text-gray-900 mb-6">{{ 'auth.registerTitle' | translate }}</h2>
        <p class="text-center text-gray-600 mb-8">
          {{ 'auth.registerSubtitle' | translate }}
        </p>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2" for="firstName">
                {{ 'auth.firstName' | translate }} <span class="text-red-500">*</span>
              </label>
              <input
                class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                id="firstName"
                type="text"
                name="firstName"
                [(ngModel)]="registerData.firstName"
                required
                minlength="2"
                #firstName="ngModel"
              >
              <div *ngIf="firstName.invalid && (firstName.dirty || firstName.touched)" class="text-sm text-red-600 mt-2">
                <div *ngIf="firstName.errors?.['required']">{{ 'validation.firstNameRequired' | translate }}</div>
                <div *ngIf="firstName.errors?.['minlength']">{{ 'validation.firstNameMinLength' | translate }}</div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2" for="lastName">
                {{ 'auth.lastName' | translate }} <span class="text-red-500">*</span>
              </label>
              <input
                class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                id="lastName"
                type="text"
                name="lastName"
                [(ngModel)]="registerData.lastName"
                required
                minlength="2"
                #lastName="ngModel"
              >
              <div *ngIf="lastName.invalid && (lastName.dirty || lastName.touched)" class="text-sm text-red-600 mt-2">
                <div *ngIf="lastName.errors?.['required']">{{ 'validation.lastNameRequired' | translate }}</div>
                <div *ngIf="lastName.errors?.['minlength']">{{ 'validation.lastNameMinLength' | translate }}</div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="username">
              {{ 'auth.username' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              id="username"
              type="text"
              name="username"
              [(ngModel)]="registerData.username"
              required
              minlength="3"
              #username="ngModel"
            >
            <div *ngIf="username.invalid && (username.dirty || username.touched)" class="text-sm text-red-600 mt-2">
              <div *ngIf="username.errors?.['required']">{{ 'validation.usernameRequired' | translate }}</div>
              <div *ngIf="username.errors?.['minlength']">{{ 'validation.usernameMinLength' | translate }}</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="email">
              {{ 'auth.email' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              id="email"
              type="email"
              name="email"
              [(ngModel)]="registerData.email"
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              #email="ngModel"
            >
            <div *ngIf="email.invalid && (email.dirty || email.touched)" class="text-sm text-red-600 mt-2">
              <div *ngIf="email.errors?.['required']">{{ 'validation.emailRequired' | translate }}</div>
              <div *ngIf="email.errors?.['pattern']">{{ 'validation.emailInvalid' | translate }}</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="phoneNumber">
              {{ 'auth.phoneNumber' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              [(ngModel)]="registerData.phoneNumber"
              required
              pattern="^\\+?[1-9]\\d{1,14}$"
              placeholder="+1234567890"
              #phone="ngModel"
            >
            <div *ngIf="phone.invalid && (phone.dirty || phone.touched)" class="text-sm text-red-600 mt-2">
              <div *ngIf="phone.errors?.['required']">{{ 'validation.phoneRequired' | translate }}</div>
              <div *ngIf="phone.errors?.['pattern']">{{ 'validation.phoneInvalid' | translate }}</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="address">
              {{ 'auth.address' | translate }}
            </label>
            <input
              class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              id="address"
              type="text"
              name="address"
              [(ngModel)]="registerData.address"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="password">
              {{ 'auth.password' | translate }} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
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
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-sm leading-5"
                (click)="togglePasswordVisibility()"
              >
                <svg *ngIf="!showPassword" class="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg *ngIf="showPassword" class="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21"></path>
                </svg>
              </button>
            </div>
            <div *ngIf="password.invalid && (password.dirty || password.touched)" class="text-sm text-red-600 mt-2">
              <div *ngIf="password.errors?.['required']">{{ 'validation.passwordRequired' | translate }}</div>
              <div *ngIf="password.errors?.['minlength']">{{ 'validation.passwordMinLength' | translate }}</div>
              <div *ngIf="password.errors?.['pattern']">{{ 'validation.passwordPattern' | translate }}</div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="confirmPassword">
              {{ 'auth.confirmPassword' | translate }} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                id="confirmPassword"
                [type]="showConfirmPassword ? 'text' : 'password'"
                name="confirmPassword"
                [(ngModel)]="registerData.confirmPassword"
                required
                #confirmPassword="ngModel"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-sm leading-5"
                (click)="toggleConfirmPasswordVisibility()"
              >
                <svg *ngIf="!showConfirmPassword" class="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg *ngIf="showConfirmPassword" class="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21"></path>
                </svg>
              </button>
            </div>
            <div *ngIf="confirmPassword.invalid && (confirmPassword.dirty || confirmPassword.touched)" class="text-sm text-red-600 mt-2">
              <div *ngIf="confirmPassword.errors?.['required']">{{ 'validation.confirmPasswordRequired' | translate }}</div>
            </div>
            <div *ngIf="confirmPassword.valid && password.valid && registerData.password !== registerData.confirmPassword" class="text-sm text-red-600 mt-2">
              {{ 'validation.passwordsDoNotMatch' | translate }}
            </div>
          </div>

          <div class="flex items-center">
            <input
              class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-200"
              id="enableMfa"
              type="checkbox"
              name="enableMfa"
              [(ngModel)]="registerData.enableMfa"
            >
            <label class="ml-3 block text-sm font-medium text-gray-700" for="enableMfa">
              {{ 'auth.enableMfa' | translate }}
            </label>
          </div>

          <div class="pt-6">
            <button
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              type="submit"
              [disabled]="!registerForm.form.valid || isSubmitting || registerData.password !== registerData.confirmPassword"
            >
              <span *ngIf="isSubmitting" class="mr-2">
                <svg class="inline-block animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ 'auth.register' | translate }}
            </button>
          </div>

          <div class="text-center mt-6">
            <a class="text-sm text-blue-600 hover:text-blue-800 transition duration-200" routerLink="/auth/login">
              {{ 'auth.haveAccount' | translate }}
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Ensure the form container is responsive */
    .max-w-lg {
      max-width: 32rem;
    }

    /* Enhance input fields */
    input {
      font-size: 0.875rem;
      line-height: 1.5;
      border-width: 1px;
    }

    /* Improve checkbox styling */
    input[type="checkbox"] {
      cursor: pointer;
    }

    /* Button disabled state */
    button:disabled {
      opacity: 0.7;
    }

    /* Add subtle shadow to form container */
    .shadow-md {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Ensure SVG icons scale appropriately */
    svg {
      transition: color 0.2s ease;
    }

    /* Improve link hover effect */
    a:hover {
      text-decoration: underline;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .max-w-lg {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      .grid-cols-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  registerData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    enableMfa: false,
    role: UserRole.CITIZEN
  };
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}

  onSubmit() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.toastr.error(this.translateService.instant('validation.passwordsDoNotMatch'), 'Error');
      return;
    }

    this.isSubmitting = true;
    
    // Create a copy of the data without confirmPassword
    const registrationData = { ...this.registerData };
    delete (registrationData as any).confirmPassword;
    
    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.toastr.success(this.translateService.instant('auth.registerSuccess'), 'Success');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error(
          error.error?.message || this.translateService.instant('errors.generalError'),
          this.translateService.instant('errors.registerFailed')
        );
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
