import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, TwoFactorAuthSetupResponse } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-setup-mfa',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-900 mb-4">{{ 'auth.setupMfa' | translate }}</h2>
        <p class="text-center text-gray-600 mb-6">
          {{ 'auth.twoFactorExplanation' | translate }}
        </p>
        
        <div *ngIf="isLoading" class="flex justify-center my-4">
          <app-loading-spinner></app-loading-spinner>
        </div>
        
        <div *ngIf="!isLoading" class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-700">{{ mfaSetupData.message }}</p>
          </div>
          
          <div *ngIf="mfaSetupData.qrCodeUrl" class="flex justify-center">
            <img [src]="mfaSetupData.qrCodeUrl" alt="QR Code" class="border p-2 max-w-xs">
          </div>
          
          <div *ngIf="mfaSetupData.secretKey" class="text-center">
            <p class="text-sm text-gray-600 mb-1">{{ 'auth.secretKey' | translate }}</p>
            <code class="text-xs bg-gray-200 p-1 rounded">{{ mfaSetupData.secretKey }}</code>
          </div>
          
          <form (ngSubmit)="verifyAndEnable()" class="space-y-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1" for="verificationCode">
                {{ 'auth.verificationCode' | translate }}
              </label>
              <input
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                id="verificationCode"
                type="text"
                name="verificationCode"
                [(ngModel)]="verificationCode"
                placeholder="123456"
                required
              >
              <p class="text-sm text-gray-500 mt-1">
                {{ 'auth.enterCodeFromApp' | translate }}
              </p>
            </div>
            
            <div class="flex gap-3">
              <button
                type="button"
                (click)="cancel()"
                class="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                {{ 'actions.cancel' | translate }}
              </button>
              
              <button
                type="submit"
                class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                [disabled]="isVerifying"
              >
                <span *ngIf="isVerifying">{{ 'actions.verifying' | translate }}</span>
                <span *ngIf="!isVerifying">{{ 'actions.verify' | translate }}</span>
              </button>
            </div>
          </form>
          
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-group {
      margin-bottom: 1rem;
    }
  `]
})
export class SetupMfaComponent implements OnInit {
  email: string = '';
  verificationCode: string = '';
  isLoading: boolean = true;
  isVerifying: boolean = false;
  errorMessage: string = '';
  mfaSetupData: TwoFactorAuthSetupResponse = { message: '', qrCodeUrl: '', secretKey: '' };
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // Get email from storage - in a real app you'd probably get this from route params or a service
    this.email = localStorage.getItem('setup_mfa_email') || '';
    
    if (!this.email) {
      this.toastr.error('Email is required to set up MFA.');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.generateMfaSecret();
  }

  generateMfaSecret() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.generateMfaSecret(this.email).subscribe({
      next: (response) => {
        this.mfaSetupData = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to generate MFA secret.';
        this.isLoading = false;
        this.toastr.error(this.errorMessage);
      }
    });
  }

  verifyAndEnable() {
    if (!this.verificationCode) {
      this.toastr.error('Please enter verification code.');
      return;
    }
    
    this.isVerifying = true;
    this.errorMessage = '';
    
    this.authService.enableMfa(this.email, this.verificationCode).subscribe({
      next: () => {
        this.isVerifying = false;
        this.toastr.success('Two-factor authentication has been enabled successfully.');
        localStorage.removeItem('setup_mfa_email');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to verify MFA code.';
        this.isVerifying = false;
        this.toastr.error(this.errorMessage);
      }
    });
  }

  cancel() {
    localStorage.removeItem('setup_mfa_email');
    this.router.navigate(['/auth/login']);
  }
} 