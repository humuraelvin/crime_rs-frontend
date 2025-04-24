import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PasswordResetService } from '../../../core/services/password-reset.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-900 mb-4">{{ 'forgotPassword.title' | translate }}</h2>
        
        <!-- Step 1: Enter Email -->
        <div *ngIf="currentStep === 1" class="space-y-6">
          <p class="text-center text-gray-600 mb-6">{{ 'forgotPassword.enterEmail' | translate }}</p>
          
          <form (ngSubmit)="requestResetCode()" #emailForm="ngForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="email">
                {{ 'forgotPassword.emailAddress' | translate }}
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="email"
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                #emailInput="ngModel"
              >
              <div *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="emailInput.errors?.['required']">{{ 'validation.emailRequired' | translate }}</div>
              </div>
            </div>
            
            <div>
              <button
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                type="submit"
                [disabled]="!emailForm.form.valid || isLoading"
              >
                <span *ngIf="isLoading" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ 'forgotPassword.sendCode' | translate }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Step 2: Enter Verification Code -->
        <div *ngIf="currentStep === 2" class="space-y-6">
          <p class="text-center text-gray-600 mb-6">{{ 'forgotPassword.enterCode' | translate }}</p>
          
          <form (ngSubmit)="verifyCode()" #codeForm="ngForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="resetCode">
                {{ 'forgotPassword.verificationCode' | translate }}
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="resetCode"
                type="text"
                name="resetCode"
                [(ngModel)]="resetCode"
                required
                maxlength="6"
                minlength="6"
                #codeInput="ngModel"
              >
              <div *ngIf="codeInput.invalid && (codeInput.dirty || codeInput.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="codeInput.errors?.['required']">{{ 'validation.codeRequired' | translate }}</div>
                <div *ngIf="codeInput.errors?.['minlength'] || codeInput.errors?.['maxlength']">{{ 'validation.codeInvalid' | translate }}</div>
              </div>
            </div>
            
            <div class="flex space-x-4">
              <button
                type="button"
                (click)="goToStep(1)"
                class="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {{ 'actions.back' | translate }}
              </button>
              
              <button
                class="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                type="submit"
                [disabled]="!codeForm.form.valid || isLoading"
              >
                <span *ngIf="isLoading" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ 'forgotPassword.verifyCode' | translate }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Step 3: Reset Password -->
        <div *ngIf="currentStep === 3" class="space-y-6">
          <p class="text-center text-gray-600 mb-6">{{ 'forgotPassword.enterNewPassword' | translate }}</p>
          
          <form (ngSubmit)="resetPassword()" #passwordForm="ngForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="newPassword">
                {{ 'forgotPassword.newPassword' | translate }}
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="newPassword"
                type="password"
                name="newPassword"
                [(ngModel)]="newPassword"
                required
                minlength="8"
                #passwordInput="ngModel"
              >
              <div *ngIf="passwordInput.invalid && (passwordInput.dirty || passwordInput.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="passwordInput.errors?.['required']">{{ 'validation.passwordRequired' | translate }}</div>
                <div *ngIf="passwordInput.errors?.['minlength']">{{ 'validation.passwordMinLength' | translate }}</div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="confirmPassword">
                {{ 'forgotPassword.confirmPassword' | translate }}
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                [(ngModel)]="confirmPassword"
                required
                #confirmInput="ngModel"
              >
              <div *ngIf="confirmInput.dirty && newPassword !== confirmPassword" class="text-xs text-red-500 mt-1">
                {{ 'validation.passwordMismatch' | translate }}
              </div>
            </div>
            
            <div class="flex space-x-4">
              <button
                type="button"
                (click)="goToStep(2)"
                class="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {{ 'actions.back' | translate }}
              </button>
              
              <button
                class="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                type="submit"
                [disabled]="!passwordForm.form.valid || newPassword !== confirmPassword || isLoading"
              >
                <span *ngIf="isLoading" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ 'forgotPassword.resetPassword' | translate }}
              </button>
            </div>
          </form>
        </div>
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                {{ 'forgotPassword.rememberPassword' | translate }}
              </span>
            </div>
          </div>
          
          <div class="mt-6">
            <a
              routerLink="/auth/login"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ 'forgotPassword.backToLogin' | translate }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ForgotPasswordComponent {
  currentStep = 1;
  email = '';
  resetCode = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  
  constructor(
    private passwordResetService: PasswordResetService,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}
  
  goToStep(step: number) {
    this.currentStep = step;
  }
  
  requestResetCode() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    this.passwordResetService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.translateService.get('messages.passwordResetRequestSuccess').subscribe((res: string) => {
          this.toastr.success(res);
        });
        this.goToStep(2);
      },
      error: (error) => {
        this.isLoading = false;
        this.translateService.get('messages.passwordResetRequestFailed').subscribe((res: string) => {
          this.toastr.error(error.message || res);
        });
      }
    });
  }
  
  verifyCode() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    this.passwordResetService.verifyResetCode(this.email, this.resetCode).subscribe({
      next: () => {
        this.isLoading = false;
        this.translateService.get('messages.passwordResetCodeVerified').subscribe((res: string) => {
          this.toastr.success(res);
        });
        this.goToStep(3);
      },
      error: (error) => {
        this.isLoading = false;
        this.translateService.get('messages.passwordResetCodeInvalid').subscribe((res: string) => {
          this.toastr.error(error.message || res);
        });
      }
    });
  }
  
  resetPassword() {
    if (this.isLoading) return;
    
    if (this.newPassword !== this.confirmPassword) {
      this.translateService.get('validation.passwordMismatch').subscribe((res: string) => {
        this.toastr.error(res);
      });
      return;
    }
    
    this.isLoading = true;
    
    this.passwordResetService.resetPassword(this.email, this.resetCode, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.translateService.get('messages.passwordResetSuccess').subscribe((res: string) => {
          this.toastr.success(res);
        });
        window.location.href = '/auth/login';
      },
      error: (error) => {
        this.isLoading = false;
        this.translateService.get('messages.passwordResetFailed').subscribe((res: string) => {
          this.toastr.error(error.message || res);
        });
      }
    });
  }
} 