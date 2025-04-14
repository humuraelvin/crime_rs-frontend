import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Welcome Back</h2>
        <p class="text-center text-gray-600 mb-8">Sign in to your account</p>
        
        <!-- Main login form - visible when not in MFA mode -->
        <div *ngIf="!showMfaField">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="email">
                Email
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
                <div *ngIf="email.errors?.['required']">Email is required</div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="password">
                Password
              </label>
              <input
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                id="password"
                type="password"
                name="password"
                [(ngModel)]="loginData.password"
                required
                #password="ngModel"
              >
              <div *ngIf="password.invalid && (password.dirty || password.touched)" class="text-xs text-red-500 mt-1">
                <div *ngIf="password.errors?.['required']">Password is required</div>
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
                  Remember me
                </label>
              </div>
              
              <div class="text-sm">
                <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
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
                Sign in
              </button>
            </div>
          </form>
        </div>
        
        <!-- MFA form - visible when MFA code is needed -->
        <div *ngIf="showMfaField" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="mfaCode">
              Two-Factor Authentication Code
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
              Back
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
              Verify
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
                Don't have an account?
              </span>
            </div>
          </div>
          
          <div class="mt-6">
            <a
              routerLink="/auth/register"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create an account
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log('Starting login process');
    
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        
        if (response.mfaRequired) {
          this.isLoading = false;
          this.showMfaField = true;
          this.toastr.info('Please enter your two-factor authentication code');
        } else {
          // Show success message
          this.toastr.success('Login successful');
          
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
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.toastr.error('Invalid email or password');
        } else if (error.status === 403) {
          this.toastr.error(error.error?.message || 'Access forbidden');
        } else if (error.status === 0) {
          this.toastr.error('Cannot connect to the server. Please try again later.');
        } else {
          this.toastr.error(error.error?.message || error.message || 'Login failed');
        }
      }
    });
  }
  
  submitMfaCode() {
    if (this.isLoading || !this.loginData.mfaCode) return;
    
    this.isLoading = true;
    
    const mfaRequest = {
      email: this.loginData.email,
      mfaCode: this.loginData.mfaCode
    };
    
    this.authService.verifyTwoFactorAuth(mfaRequest).subscribe({
      next: (response) => {
        // Show success message
        this.toastr.success('Login successful');
        
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
      },
      error: (error) => {
        this.isLoading = false;
        console.error('MFA verification error:', error);
        this.toastr.error('Invalid verification code');
      }
    });
  }
} 