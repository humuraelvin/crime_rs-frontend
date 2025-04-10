import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-3xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
            <button 
              (click)="refreshProfile()" 
              class="text-blue-500 hover:text-blue-700"
              [disabled]="isLoading">
              <span class="material-icons">refresh</span>
            </button>
          </div>
          
          <div *ngIf="isLoading" class="flex justify-center my-8">
            <app-loading-spinner></app-loading-spinner>
          </div>

          <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
          </div>

          <div *ngIf="!isLoading && !error" class="bg-white shadow-md rounded-lg overflow-hidden">
            <!-- Profile Header -->
            <div class="p-6 bg-gray-50 border-b">
              <div class="flex items-center">
                <div class="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {{ userInitials }}
                </div>
                <div class="ml-6">
                  <h2 class="text-2xl font-bold text-gray-900">{{ userData.firstName }} {{ userData.lastName }}</h2>
                  <p class="text-gray-600">{{ userData.email }}</p>
                </div>
              </div>
            </div>
            
            <!-- Profile Actions -->
            <div class="p-6 border-b">
              <div class="flex space-x-4">
                <a routerLink="edit" 
                   class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Edit Profile
                </a>
                <a routerLink="change-password" 
                   class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                  Change Password
                </a>
              </div>
            </div>
            
            <!-- Profile Details -->
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                  <div class="space-y-3">
                    <p class="text-gray-600">
                      <span class="font-medium">First Name:</span> {{ userData.firstName }}
                    </p>
                    <p class="text-gray-600">
                      <span class="font-medium">Last Name:</span> {{ userData.lastName }}
                    </p>
                    <p class="text-gray-600">
                      <span class="font-medium">Email:</span> {{ userData.email }}
                    </p>
                    <p class="text-gray-600">
                      <span class="font-medium">Phone:</span> {{ userData.phone || 'Not provided' }}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-4">Preferences</h3>
                  <div class="space-y-3">
                    <p class="text-gray-600">
                      <span class="font-medium">Email Notifications:</span>
                      {{ userData.emailNotifications ? 'Enabled' : 'Disabled' }}
                    </p>
                    <p class="text-gray-600">
                      <span class="font-medium">SMS Notifications:</span>
                      {{ userData.smsNotifications ? 'Enabled' : 'Disabled' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  userData: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emailNotifications: false,
    smsNotifications: false
  };
  isLoading = false;
  error: string | null = null;

  get userInitials(): string {
    return `${this.userData.firstName.charAt(0)}${this.userData.lastName.charAt(0)}`.toUpperCase();
  }

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.error = null;
    
    const user = this.authService.currentUserValue;
    if (user) {
      this.userData = {
        ...this.userData,
        ...user,
        emailNotifications: user.emailNotifications || false,
        smsNotifications: user.smsNotifications || false
      };
      this.isLoading = false;
    } else {
      this.error = 'Unable to load profile data. Please try again.';
      this.isLoading = false;
    }
  }

  refreshProfile() {
    if (!this.isLoading) {
      this.loadProfile();
    }
  }
} 