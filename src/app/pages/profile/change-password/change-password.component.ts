import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-md mx-auto">
          <div class="flex items-center justify-between mb-4">
            <button 
              routerLink="/profile" 
              class="flex items-center text-blue-600 hover:text-blue-800">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              {{ 'actions.back' | translate }}
            </button>
          </div>
          
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ 'profile.changePassword' | translate }}</h2>
            
            <!-- Loading spinner -->
            <div *ngIf="isLoading" class="flex justify-center my-4">
              <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            <form (ngSubmit)="onSubmit()" class="space-y-4" [class.opacity-50]="isLoading">
              <div class="form-group">
                <label for="currentPassword" class="form-label">{{ 'profile.currentPassword' | translate }}</label>
                <input type="password" id="currentPassword" name="currentPassword" 
                       [(ngModel)]="passwordData.currentPassword"
                       class="form-input"
                       placeholder="••••••••"
                       [disabled]="isLoading">
              </div>
              
              <div class="form-group">
                <label for="newPassword" class="form-label">{{ 'profile.newPassword' | translate }}</label>
                <input type="password" id="newPassword" name="newPassword" 
                       [(ngModel)]="passwordData.newPassword"
                       class="form-input"
                       placeholder="••••••••"
                       [disabled]="isLoading">
              </div>
              
              <div class="form-group">
                <label for="confirmPassword" class="form-label">{{ 'profile.confirmPassword' | translate }}</label>
                <input type="password" id="confirmPassword" name="confirmPassword" 
                       [(ngModel)]="passwordData.confirmPassword"
                       class="form-input"
                       placeholder="••••••••"
                       [disabled]="isLoading">
              </div>
              
              <div class="flex space-x-4 mt-6">
                <button type="button" (click)="onCancel()" 
                        class="form-button-secondary flex-1"
                        [disabled]="isLoading">
                  {{ 'actions.cancel' | translate }}
                </button>
                <button type="submit" 
                        class="form-button-primary flex-1"
                        [disabled]="isLoading">
                  {{ 'profile.changePassword' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChangePasswordComponent implements OnInit {
  passwordData: PasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    // Fetch the latest user profile data
    this.isLoading = true;
    this.authService.getUserProfile().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to fetch profile data:', error);
        this.isLoading = false;
        this.translateService.get('messages.profileLoadFailed').subscribe((res: string) => {
          this.toastr.warning(res);
        });
      }
    });
  }

  onSubmit() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.translateService.get('profile.passwordMismatch').subscribe((res: string) => {
        this.toastr.error(res);
      });
      return;
    }

    this.isLoading = true;
    this.authService.updatePassword(this.passwordData.currentPassword, this.passwordData.newPassword)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.translateService.get('messages.passwordChanged').subscribe((res: string) => {
            this.toastr.success(res);
          });
          this.router.navigate(['/profile']);
        },
        error: (error: Error) => {
          this.isLoading = false;
          this.translateService.get('messages.passwordChangeFailed').subscribe((res: string) => {
            this.toastr.error(error.message || res);
          });
        }
      });
  }

  onCancel() {
    this.router.navigate(['/profile']);
  }
} 