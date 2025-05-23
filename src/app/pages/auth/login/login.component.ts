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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div class="max-w-md w-full p-8 bg-white rounded-xl shadow-md">
        <h2 class="text-3xl font-semibold text-center text-gray-900 mb-6">{{ 'auth.welcomeBack' | translate }}</h2>
        <p class="text-center text-gray-600 mb-8">{{ 'auth.signInAccount' | translate }}</p>

        <!-- Main login form - visible when not in MFA mode -->
        <div *ngIf="!showMfaField">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2" for="email">
                {{ 'auth.email' | translate }}
              </label>
              <input
                class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                id="email"
                type="email"
                name="email"
                [(ngModel)]="loginData.email"
                required
                #email="ngModel"
              >
              <div *ngIf="email.invalid && (email.dirty || email.touched)" class="text-sm text-red-600 mt-2">
                <div *ngIf="email.errors?.['required']">{{ 'validation.emailRequired' | translate }}</div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2" for="password">
                {{ 'auth.password' | translate }}
              </label>
              <div class="relative">
                <input
                  class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="loginData.password"
                  required
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
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-200"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  [(ngModel)]="rememberMe"
                >
                <label class="ml-3 block text-sm font-medium text-gray-700" for="remember-me">
                  {{ 'auth.rememberMe' | translate }}
                </label>
              </div>

              <div class="text-sm">
                <a routerLink="/auth/forgot-password" class="font-medium text-blue-600 hover:text-blue-800 transition duration-200">
                  {{ 'auth.forgotPassword' | translate }}
                </a>
              </div>
            </div>

            <div>
              <button
                class="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
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
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  {{ 'auth.verificationCodeSent' | translate }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="mfaCode">
              {{ 'auth.emailVerificationCode' | translate }}
            </label>
            <input
              class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              id="mfaCode"
              type="text"
              name="mfaCode"
              [(ngModel)]="loginData.mfaCode"
              required
              minlength="6"
              maxlength="6"
              pattern="[0-9]+"
              placeholder="Enter 6-digit code"
            >
            <p class="text-sm text-gray-500 mt-2">
              {{ 'auth.checkEmailForCode' | translate }}
            </p>
          </div>

          <div class="flex justify-between gap-4">
            <button
              (click)="showMfaField = false"
              class="px-4 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
            >
              {{ 'actions.back' | translate }}
            </button>

            <button
              (click)="submitMfaCode()"
              class="px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
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

          <div class="text-center pt-2">
            <button
              type="button"
              (click)="resendMfaCode()"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              {{ 'auth.resendCode' | translate }}
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
              class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
            >
              {{ 'auth.createAccount' | translate }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Ensure the form container is responsive */
    .max-w-md {
      max-width: 28rem;
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
      .max-w-md {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
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
  showPassword = false;
  error: string | null = null;

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
          this.translateService.get('messages.loginSuccess').subscribe((res: string) => {
            this.toastr.success(res);
          });

          let targetRoute = '/dashboard';

          if (response.role === UserRole.ADMIN) {
            targetRoute = '/admin';
          } else if (response.role === UserRole.POLICE_OFFICER) {
            targetRoute = '/police/dashboard';
          }

          console.log(`Login successful for role ${response.role}, navigating to ${targetRoute}`);
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
          this.translateService.get('messages.unauthorized').subscribe((res: string) => {
            this.toastr.error(error.error?.message || res);
          });
        } else if (error.status === 0) {
          this.translateService.get('messages.connectionError').subscribe((res: string) => {
            this.toastr.error(res);
          });
        } else {
          this.translateService.get('messages.loginFailed').subscribe((res: string) => {
            this.toastr.error(error.error?.message || error.message || res);
          });
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

        this.translateService.get('messages.loginSuccess').subscribe((res: string) => {
          this.toastr.success(res);
        });

        let targetRoute = '/dashboard';

        if (response.role === UserRole.ADMIN) {
          targetRoute = '/admin';
        } else if (response.role === UserRole.POLICE_OFFICER) {
          targetRoute = '/police/dashboard';
        }

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

  resendMfaCode(): void {
    this.isLoading = true;
    
    // First clear any existing errors
    this.error = null;
    
    // Call the login API again which will trigger a new MFA code to be sent
    this.authService.login({
      email: this.loginData.email,
      password: this.loginData.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.translateService.get('messages.codeSent').subscribe((res: string) => {
          this.toastr.info(res);
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.translateService.get('messages.errorResendingCode').subscribe((res: string) => {
          this.toastr.error(res);
        });
      }
    });
  }
}
