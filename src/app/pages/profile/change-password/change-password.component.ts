import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-md mx-auto">
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
            
            <form (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" 
                       [(ngModel)]="passwordData.currentPassword"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" id="newPassword" name="newPassword" 
                       [(ngModel)]="passwordData.newPassword"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" 
                       [(ngModel)]="passwordData.confirmPassword"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              
              <div class="flex justify-end space-x-4">
                <button type="button" (click)="onCancel()" 
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                  Cancel
                </button>
                <button type="submit" 
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Change Password
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

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {}

  onSubmit() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastr.error('New passwords do not match');
      return;
    }

    this.authService.updatePassword(this.passwordData.currentPassword, this.passwordData.newPassword)
      .subscribe({
        next: () => {
          this.toastr.success('Password changed successfully');
          this.router.navigate(['/profile']);
        },
        error: (error: Error) => {
          this.toastr.error(error.message || 'Failed to change password');
        }
      });
  }

  onCancel() {
    this.router.navigate(['/profile']);
  }
} 