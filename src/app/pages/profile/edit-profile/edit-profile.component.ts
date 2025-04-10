import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-3xl mx-auto">
          <div class="mb-8">
            <a routerLink="/profile" class="text-blue-600 hover:text-blue-800">← Back to Profile</a>
          </div>
          
          <div class="bg-white shadow-md rounded-lg p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
            
            <form (ngSubmit)="onSubmit()" #profileForm="ngForm">
              <div class="space-y-6">
                <!-- Personal Information -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input type="text" name="firstName" [(ngModel)]="profileData.firstName"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input type="text" name="lastName" [(ngModel)]="profileData.lastName"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required>
                    </div>
                  </div>
                </div>
                
                <!-- Contact Information -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-4">Contact Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" name="email" [(ngModel)]="profileData.email"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" name="phone" [(ngModel)]="profileData.phone"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    </div>
                  </div>
                </div>
                
                <!-- Preferences -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-4">Preferences</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="flex items-center">
                        <input type="checkbox" name="emailNotifications" [(ngModel)]="profileData.emailNotifications"
                          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <span class="ml-2 text-gray-700">Receive Email Notifications</span>
                      </label>
                    </div>
                    <div>
                      <label class="flex items-center">
                        <input type="checkbox" name="smsNotifications" [(ngModel)]="profileData.smsNotifications"
                          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <span class="ml-2 text-gray-700">Receive SMS Notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Submit Button -->
              <div class="mt-8 flex justify-end">
                <button type="submit"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Save Changes
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
export class EditProfileComponent implements OnInit {
  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emailNotifications: true,
    smsNotifications: false
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.profileData = {
        ...this.profileData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email
      };
    }
  }

  onSubmit() {
    this.authService.updateUserProfile(this.profileData).subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully');
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Failed to update profile');
      }
    });
  }
} 