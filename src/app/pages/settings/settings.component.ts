import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto max-w-4xl px-4">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
          <button 
            routerLink="/dashboard" 
            class="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded text-gray-700 flex items-center">
            <span class="mr-1">←</span>
            Back to Dashboard
          </button>
        </div>
        
        <div *ngIf="!loading">
          <!-- Settings Sections -->
          <div class="space-y-6">
            <!-- Account Settings Section -->
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
              
              <div class="border-b pb-4 mb-4">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 class="text-lg font-medium text-gray-700">User Information</h3>
                    <p class="text-sm text-gray-500">Manage your account information</p>
                  </div>
                  <div class="mt-2 md:mt-0">
                    <button 
                      routerLink="/profile" 
                      class="text-blue-600 hover:text-blue-800 hover:underline">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Change Password Section -->
              <div class="border-b pb-4 mb-4">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 class="text-lg font-medium text-gray-700">Password</h3>
                    <p class="text-sm text-gray-500">Update your password regularly for better security</p>
                  </div>
                  <div class="mt-2 md:mt-0">
                    <button 
                      (click)="changePasswordSection = !changePasswordSection" 
                      class="text-blue-600 hover:text-blue-800 hover:underline">
                      Change Password
                    </button>
                  </div>
                </div>
                
                <!-- Change Password Form - Only shown when clicked -->
                <div *ngIf="changePasswordSection" class="mt-4 p-4 bg-gray-50 rounded-md">
                  <div class="space-y-4">
                    <div>
                      <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input 
                        type="password" 
                        id="currentPassword"
                        [(ngModel)]="passwordData.currentPassword"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div>
                      <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input 
                        type="password" 
                        id="newPassword"
                        [(ngModel)]="passwordData.newPassword"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div>
                      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input 
                        type="password" 
                        id="confirmPassword"
                        [(ngModel)]="passwordData.confirmPassword"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <div class="pt-2 flex justify-end space-x-3">
                      <button 
                        (click)="changePasswordSection = false" 
                        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">
                        Cancel
                      </button>
                      <button 
                        (click)="updatePassword()" 
                        [disabled]="!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword"
                        [ngClass]="{'bg-blue-600 hover:bg-blue-700': passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword, 'bg-blue-300 cursor-not-allowed': !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}"
                        class="px-4 py-2 text-white rounded">
                        Update Password
                      </button>
                    </div>
                    
                    <div *ngIf="passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword" class="text-red-500 text-sm">
                      Passwords do not match.
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Account Deletion Section -->
              <div>
                <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 class="text-lg font-medium text-gray-700">Delete Account</h3>
                    <p class="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <div class="mt-2 md:mt-0">
                    <button 
                      (click)="deleteAccountSection = !deleteAccountSection" 
                      class="text-red-600 hover:text-red-800 hover:underline">
                      Delete Account
                    </button>
                  </div>
                </div>
                
                <!-- Delete Account Confirmation - Only shown when clicked -->
                <div *ngIf="deleteAccountSection" class="mt-4 p-4 bg-red-50 rounded-md border border-red-200">
                  <p class="text-red-700 font-medium">Are you sure you want to delete your account?</p>
                  <p class="text-sm text-red-600 mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
                  
                  <div>
                    <label for="deleteConfirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                      Confirm with your password
                    </label>
                    <input 
                      type="password" 
                      id="deleteConfirmPassword"
                      [(ngModel)]="deleteAccountPassword"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  <div class="mt-4 flex justify-end space-x-3">
                    <button 
                      (click)="deleteAccountSection = false" 
                      class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">
                      Cancel
                    </button>
                    <button 
                      (click)="deleteAccount()" 
                      [disabled]="!deleteAccountPassword"
                      [ngClass]="{'bg-red-600 hover:bg-red-700': deleteAccountPassword, 'bg-red-300 cursor-not-allowed': !deleteAccountPassword}"
                      class="px-4 py-2 text-white rounded">
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Notification Settings Section -->
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
              
              <div class="space-y-4">
                <div class="flex items-start pb-4 border-b">
                  <div class="flex h-5 items-center">
                    <input 
                      id="emailNotifications" 
                      type="checkbox"
                      [(ngModel)]="notificationSettings.emailNotifications"
                      (change)="updateNotificationSettings()"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="emailNotifications" class="font-medium text-gray-700">Email Notifications</label>
                    <p class="text-gray-500">Receive notifications about your complaints via email</p>
                  </div>
                </div>
                
                <div class="flex items-start pt-2">
                  <div class="flex h-5 items-center">
                    <input 
                      id="smsNotifications" 
                      type="checkbox"
                      [(ngModel)]="notificationSettings.smsNotifications"
                      (change)="updateNotificationSettings()"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="smsNotifications" class="font-medium text-gray-700">SMS Notifications</label>
                    <p class="text-gray-500">Receive notifications about your complaints via SMS</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Two-Factor Authentication Section - Only for supported roles -->
            <div *ngIf="supportsMFA" class="bg-white p-6 rounded-lg shadow-md">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
              
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-700">Two-Factor Authentication</h3>
                  <p class="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  <p *ngIf="user?.mfaEnabled" class="mt-1 text-sm text-green-600">
                    Two-factor authentication is currently enabled.
                  </p>
                  <p *ngIf="!user?.mfaEnabled" class="mt-1 text-sm text-yellow-600">
                    Two-factor authentication is currently disabled.
                  </p>
                </div>
                <div>
                  <button 
                    *ngIf="!user?.mfaEnabled" 
                    (click)="setupMFA()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    Enable 2FA
                  </button>
                  <button 
                    *ngIf="user?.mfaEnabled" 
                    (click)="disableMFASection = !disableMFASection"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                    Disable 2FA
                  </button>
                </div>
              </div>
              
              <!-- Disable MFA Form -->
              <div *ngIf="disableMFASection" class="mt-4 p-4 bg-gray-50 rounded-md">
                <p class="text-sm text-gray-600 mb-3">Enter your password to disable two-factor authentication:</p>
                
                <div>
                  <label for="mfaPassword" class="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input 
                    type="password" 
                    id="mfaPassword"
                    [(ngModel)]="mfaDisablePassword"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
                
                <div class="mt-4 flex justify-end space-x-3">
                  <button 
                    (click)="disableMFASection = false" 
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">
                    Cancel
                  </button>
                  <button 
                    (click)="disableMFA()" 
                    [disabled]="!mfaDisablePassword"
                    [ngClass]="{'bg-red-600 hover:bg-red-700': mfaDisablePassword, 'bg-red-300 cursor-not-allowed': !mfaDisablePassword}"
                    class="px-4 py-2 text-white rounded">
                    Disable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="loading" class="py-12 flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  loading = true;
  
  // Password change section
  changePasswordSection = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  // Delete account section
  deleteAccountSection = false;
  deleteAccountPassword = '';
  
  // MFA section
  supportsMFA = false;
  disableMFASection = false;
  mfaDisablePassword = '';
  
  // Notification settings
  notificationSettings = {
    emailNotifications: false,
    smsNotifications: false
  };
  
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    
    if (this.user) {
      // Initialize notification settings from user data
      this.notificationSettings.emailNotifications = this.user.emailNotifications || false;
      this.notificationSettings.smsNotifications = this.user.smsNotifications || false;
      
      // Check if user role supports MFA
      this.supportsMFA = this.authService.hasAnyRole([
        UserRole.ADMIN, 
        UserRole.POLICE_OFFICER
      ]);
    }
    
    this.loading = false;
  }
  
  updatePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastr.error('New passwords do not match');
      return;
    }
    
    this.loading = true;
    this.authService.updatePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: () => {
        this.toastr.success('Password updated successfully');
        // Reset form
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.changePasswordSection = false;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error.message || 'Failed to update password');
        this.loading = false;
      }
    });
  }
  
  updateNotificationSettings(): void {
    if (!this.user) return;
    
    this.loading = true;
    
    // Create update data
    const userData = {
      emailNotifications: this.notificationSettings.emailNotifications,
      smsNotifications: this.notificationSettings.smsNotifications
    };
    
    this.authService.updateUserProfile(userData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.toastr.success('Notification settings updated');
        this.loading = false;
      },
      error: (error) => {
        // Reset to previous values
        if (this.user) {
          this.notificationSettings.emailNotifications = this.user.emailNotifications || false;
          this.notificationSettings.smsNotifications = this.user.smsNotifications || false;
        }
        this.toastr.error(error.message || 'Failed to update notification settings');
        this.loading = false;
      }
    });
  }
  
  setupMFA(): void {
    // Navigate to MFA setup page
    this.router.navigate(['/auth/setup-mfa']);
  }
  
  disableMFA(): void {
    if (!this.user || !this.mfaDisablePassword) return;
    
    this.loading = true;
    
    this.authService.disableMfa(this.user.email, this.mfaDisablePassword).subscribe({
      next: () => {
        this.toastr.success('Two-factor authentication disabled');
        this.disableMFASection = false;
        this.mfaDisablePassword = '';
        this.loading = false;
        
        // Make sure user object is updated
        if (this.user) {
          this.user.mfaEnabled = false;
        }
      },
      error: (error) => {
        this.toastr.error(error.message || 'Failed to disable two-factor authentication');
        this.loading = false;
      }
    });
  }
  
  deleteAccount(): void {
    if (!this.deleteAccountPassword) return;
    
    // Show confirmation dialog
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      this.loading = true;
      
      // Note: You need to implement the deleteAccount method in AuthService
      // This is a placeholder for the API call
      setTimeout(() => {
        this.toastr.info('Account deletion is not implemented in this version.');
        this.deleteAccountSection = false;
        this.deleteAccountPassword = '';
        this.loading = false;
      }, 1500);
    }
  }
} 