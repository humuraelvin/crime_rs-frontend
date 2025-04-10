import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, TwoFactorAuthSetupResponse } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-setup-mfa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-900 mb-4">Two-Factor Authentication Setup</h2>
        <p class="text-center text-gray-600 mb-8">
          Scan the QR code with your authenticator app and enter the verification code to enable two-factor authentication.
        </p>
        
        <div *ngIf="isLoading" class="flex justify-center mb-6">
          <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <div *ngIf="!isLoading && mfaSetupData" class="mb-6">
          <div class="flex justify-center mb-4">
            <img [src]="mfaSetupData.qrCodeUrl" alt="QR Code" class="border p-2 rounded-lg">
          </div>
          
          <div class="bg-gray-100 p-3 rounded-lg text-center mb-4">
            <p class="text-sm text-gray-700 mb-1">If you cannot scan the QR code, use this secret key:</p>
            <code class="text-xs bg-gray-200 p-1 rounded">{{ mfaSetupData.secretKey }}</code>
          </div>
          
          <form (ngSubmit)="onSubmit()" #verifyForm="ngForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="verificationCode">
                Verification Code
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="verificationCode"
                type="text"
                name="verificationCode"
                [(ngModel)]="verificationCode"
                required
                minlength="6"
                maxlength="6"
                pattern="[0-9]+"
                placeholder="Enter 6-digit code"
                #code="ngModel"
              >
              <div *ngIf="code.invalid && (code.dirty || code.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="code.errors?.['required']">Verification code is required</div>
                <div *ngIf="code.errors?.['pattern'] || code.errors?.['minlength'] || code.errors?.['maxlength']">
                  Please enter a valid 6-digit code
                </div>
              </div>
            </div>
            
            <div class="flex justify-between pt-4">
              <button
                type="button"
                (click)="onSkip()"
                class="bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Skip for now
              </button>
              
              <button
                type="submit"
                [disabled]="!verifyForm.form.valid || isSubmitting"
                class="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <span *ngIf="isSubmitting" class="mr-2">
                  <svg class="inline-block animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Verify
              </button>
            </div>
          </form>
        </div>
        
        <div *ngIf="!isLoading && error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SetupMfaComponent implements OnInit {
  email: string = '';
  verificationCode: string = '';
  mfaSetupData: TwoFactorAuthSetupResponse | null = null;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
        this.generateMfaSecret();
      } else {
        this.error = 'Email parameter is missing';
        this.isLoading = false;
      }
    });
  }

  generateMfaSecret() {
    this.isLoading = true;
    this.error = null;
    
    this.authService.generateMfaSecret(this.email).subscribe({
      next: (response) => {
        this.mfaSetupData = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to generate MFA setup. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (!this.email || !this.verificationCode) {
      this.toastr.error('Email and verification code are required');
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    this.authService.enableMfa(this.email, this.verificationCode).subscribe({
      next: () => {
        this.toastr.success('Two-factor authentication has been enabled successfully');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.error = error.message || 'Invalid verification code. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onSkip() {
    this.toastr.info('Two-factor authentication setup was skipped. You can enable it later in your profile settings.');
    this.router.navigate(['/auth/login']);
  }
} 