import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, AuthResponse, MfaVerificationRequest } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../../../core/models/user.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">{{ 'auth.welcomeBack' | translate }}</h2>
        <p class="text-center text-gray-600 mb-8">{{ 'auth.signInAccount' | translate }}</p>

        <!-- Main login form - visible when not in MFA mode -->
        <div *ngIf="!showMfaField">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="email">
                {{ 'auth.email' | translate }}
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="email"
                type="email"
                name="email"
                [(ngModel)]="loginData.email"
                required
                #email="ngModel"
              >
              <div *ngIf="email.invalid && (email.dirty || email.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="email.errors?.['required']">{{ 'validation.emailRequired' | translate }}</div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="password">
                {{ 'auth.password' | translate }}
              </label>
              <div class="relative">
                <input
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="loginData.password"
                  required
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
                <div *ngIf="password.errors?.['required']">{{ 'validation.passwordRequired' | translate }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  [(ngModel)]="rememberMe"
                >
                <label class="ml-2 block text-sm text-gray-900" for="remember-me">
                  {{ 'auth.rememberMe' | translate }}
                </label>
              </div>

              <div class="text-sm">
                <a routerLink="/auth/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                  {{ 'auth.forgotPassword' | translate }}
                </a>
              </div>
            </div>

            <div>
              <button
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                type="submit"
                [disabled]="!loginForm.form.valid || isLoading"
              >
                <span *ngIf="isLoading" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ 'auth.signIn' | translate }}
              </button>
            </div>
          </form>
        </div>

        <!-- MFA form - visible when MFA code is needed -->
        <div *ngIf="showMfaField" class="space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="mfaCode">
              {{ 'auth.twoFactorCode' | translate }}
            </label>
            <input
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              id="mfaCode"
              type="text"
              name="mfaCode"
              [(ngModel)]="loginData.mfaCode"
              required
            >
          </div>

          <div class="flex justify-between">
            <button
              (click)="showMfaField = false"
              class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {{ 'actions.back' | translate }}
            </button>

            <button
              (click)="submitMfaCode()"
              class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              [disabled]="!loginData.mfaCode || isLoading"
            >
              <span *ngIf="isLoading" class="mr-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ 'actions.verify' | translate }}
            </button>
          </div>
        </div>

        <!-- Hidden form for direct navigation post-login -->
        <!-- This technique prevents router freezes by using standard browser form submission -->
        <form #directNavForm id="directNavForm" method="GET" style="display:none;">
          <input type="hidden" name="dummy" value="1">
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                {{ 'auth.noAccount' | translate }}
              </span>
            </div>
          </div>

          <div class="mt-6">
            <a
              routerLink="/auth/register"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ 'auth.createAccount' | translate }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
    mfaCode: ''
  };

  rememberMe = false;
  showMfaField = false;
  isLoading = false;
  showPassword = false; // Property to track password visibility

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    console.log('Starting login process');

    this.authService.login(this.loginData).subscribe({
      next: (response: AuthResponse) => {
        console.log('Login response:', response);

        if (response.mfaRequired) {
          this.isLoading = false;
          this.showMfaField = true;
          this.translateService.get('messages.enterTwoFactorCode').subscribe((res: string) => {
            this.toastr.info(res);
          });
        } else {
          // Show success message
          this.translateService.get('messages.loginSuccess').subscribe((res: string) => {
            this.toastr.success(res);
          });

          // Direct URL navigation based on role
          let targetRoute = '/dashboard';

          if (response.role === UserRole.ADMIN) {
            targetRoute = '/admin';
          } else if (response.role === UserRole.POLICE_OFFICER) {
            targetRoute = '/police/dashboard';
          }

          console.log(`Login successful for role ${response.role}, navigating to ${targetRoute}`);

          // Use window.location for direct navigation
          window.location.href = targetRoute;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Login error:', error);

        if (error.status === 401) {
          this.translateService.get('messages.loginFailed').subscribe((res: string) => {
            this.toastr.error(res);
          });
        } else if (error.status === 403) {
          this.toastr.error(error.error?.message || 'Accès non autorisé');
        } else if (error.status === 0) {
          this.translateService.get('messages.connectionError').subscribe((res: string) => {
            this.toastr.error(res);
          });
        } else {
          this.toastr.error(error.error?.message || error.message || 'Échec de connexion');
        }
      }
    });
  }

  submitMfaCode(): void {
    if (this.isLoading || !this.loginData.mfaCode) return;

    this.isLoading = true;
    console.log('Submitting MFA code');

    const mfaRequest: MfaVerificationRequest = {
      email: this.loginData.email,
      mfaCode: this.loginData.mfaCode
    };

    this.authService.verifyTwoFactorAuth(mfaRequest).subscribe({
      next: (response: AuthResponse) => {
        console.log('MFA verification response:', response);
        this.isLoading = false;

        // Show success message
        this.translateService.get('messages.loginSuccess').subscribe((res: string) => {
          this.toastr.success(res);
        });

        // Direct URL navigation based on role
        let targetRoute = '/dashboard';

        if (response.role === UserRole.ADMIN) {
          targetRoute = '/admin';
        } else if (response.role === UserRole.POLICE_OFFICER) {
          targetRoute = '/police/dashboard';
        }

        // Use window.location for direct navigation
        window.location.href = targetRoute;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('MFA verification error:', error);

        this.translateService.get('messages.invalidTwoFactorCode').subscribe((res: string) => {
          this.toastr.error(res);
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
