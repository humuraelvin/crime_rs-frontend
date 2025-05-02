import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../core/models/user.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header and back button -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">{{ 'profile.updateInfo' | translate }}</h1>
          <button 
            type="button" 
            (click)="goBack()" 
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ 'actions.back' | translate }}
          </button>
        </div>
        
        <form #profileForm="ngForm" (ngSubmit)="profileForm.valid && onSubmit()">
          <!-- Personal Information -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ 'profile.personalInfo' | translate }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                {{ 'profile.personalInfo' | translate }}
              </p>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <!-- First Name -->
                <div>
                  <label for="firstName" class="form-label">{{ 'auth.firstName' | translate }}</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    id="firstName" 
                    name="firstName"
                    [(ngModel)]="profileData.firstName"
                    required
                    #firstName="ngModel"
                    placeholder="John"
                  >
                  <div *ngIf="firstName.invalid && (firstName.dirty || firstName.touched)" class="form-error">
                    {{ 'validation.firstNameRequired' | translate }}
                  </div>
                </div>
                
                <!-- Last Name -->
                <div>
                  <label for="lastName" class="form-label">{{ 'auth.lastName' | translate }}</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    id="lastName" 
                    name="lastName"
                    [(ngModel)]="profileData.lastName"
                    required
                    #lastName="ngModel"
                    placeholder="Doe"
                  >
                  <div *ngIf="lastName.invalid && (lastName.dirty || lastName.touched)" class="form-error">
                    {{ 'validation.lastNameRequired' | translate }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Contact Information -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ 'profile.contactInfo' | translate }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                {{ 'profile.contactInfo' | translate }}
              </p>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <!-- Email -->
                <div>
                  <label for="email" class="form-label">{{ 'auth.email' | translate }}</label>
                  <input 
                    type="email" 
                    class="form-input" 
                    id="email" 
                    name="email"
                    [(ngModel)]="profileData.email"
                    required
                    email
                    #email="ngModel"
                    placeholder="john.doe@example.com"
                  >
                  <div *ngIf="email.invalid && (email.dirty || email.touched)" class="form-error">
                    <span *ngIf="email.errors?.['required']">{{ 'validation.emailRequired' | translate }}</span>
                    <span *ngIf="email.errors?.['email']">{{ 'validation.emailInvalid' | translate }}</span>
                  </div>
                </div>
                
                <!-- Phone -->
                <div>
                  <label for="phone" class="form-label">{{ 'auth.phoneNumber' | translate }}</label>
                  <input 
                    type="tel" 
                    class="form-input" 
                    id="phone" 
                    name="phone"
                    [(ngModel)]="profileData.phone"
                    #phone="ngModel"
                    placeholder="+1 (234) 567-8910"
                  >
                  <div *ngIf="phone.invalid && (phone.dirty || phone.touched)" class="form-error">
                    {{ 'validation.phoneInvalid' | translate }}
                  </div>
                </div>
                
                <!-- Address -->
                <div class="sm:col-span-2">
                  <label for="address" class="form-label">{{ 'auth.address' | translate }}</label>
                  <textarea 
                    class="form-input bg-gray-100"
                    id="address" 
                    name="address"
                    [(ngModel)]="profileData.address"
                    rows="3"
                    disabled
                    placeholder="{{ 'profile.notProvided' | translate }}"
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1 italic">{{ 'profile.addressReadOnly' | translate }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Preferences -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ 'profile.preferences' | translate }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                {{ 'profile.preferences' | translate }}
              </p>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="space-y-4">
                <!-- Email Notifications -->
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                      id="emailNotifications" 
                      name="emailNotifications"
                      [(ngModel)]="profileData.emailNotifications"
                    >
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="emailNotifications" class="font-medium text-gray-700">
                      {{ 'profile.emailNotifications' | translate }}
                    </label>
                    <p class="text-gray-500">{{ 'profile.emailNotifications' | translate }}</p>
                  </div>
                </div>
                
                <!-- SMS Notifications -->
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                      id="smsNotifications" 
                      name="smsNotifications"
                      [(ngModel)]="profileData.smsNotifications"
                    >
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="smsNotifications" class="font-medium text-gray-700">
                      {{ 'profile.smsNotifications' | translate }}
                    </label>
                    <p class="text-gray-500">{{ 'profile.smsNotifications' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4">
            <button 
              type="button" 
              (click)="goBack()" 
              class="form-button-secondary"
            >
              {{ 'actions.cancel' | translate }}
            </button>
            <button 
              type="submit" 
              [disabled]="profileForm.invalid || isSubmitting"
              class="form-button-primary"
            >
              <span *ngIf="isSubmitting" class="mr-2">
                <svg class="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isSubmitting ? ('actions.saving' | translate) : ('actions.save' | translate) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class EditProfileComponent implements OnInit {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
  } = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emailNotifications: true,
    smsNotifications: false
  };

  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.isSubmitting = true;
    
    // First fetch the latest user profile from the backend
    this.authService.getUserProfile().subscribe({
      next: () => {
        this.loadUserProfile();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.translateService.get('messages.profileLoadFailed').subscribe((res: string) => {
          this.toastr.error(error.message || res);
        });
        this.loadUserProfile(); // Still try to load from local data
        this.isSubmitting = false;
      }
    });
  }

  loadUserProfile(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.profileData.firstName = currentUser.firstName || '';
      this.profileData.lastName = currentUser.lastName || '';
      this.profileData.email = currentUser.email || '';
      this.profileData.phone = currentUser.phoneNumber || '';
      this.profileData.address = currentUser.address || '';
      
      // Use notification properties directly from the User model
      this.profileData.emailNotifications = currentUser.emailNotifications;
      this.profileData.smsNotifications = currentUser.smsNotifications;
    }
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  onSubmit(): void {
    this.isSubmitting = true;
    
    // Create a copy of the profile data with the correct field names for the backend
    // Note: address is removed because the backend doesn't support it yet
    const profileDataForBackend = {
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      email: this.profileData.email,
      phoneNumber: this.profileData.phone, // Map phone to phoneNumber for backend
      emailNotifications: this.profileData.emailNotifications,
      smsNotifications: this.profileData.smsNotifications
    };
    
    this.authService.updateUserProfile(profileDataForBackend)
      .subscribe({
        next: (updatedUser: User) => {
          this.isSubmitting = false;
          this.translateService.get('messages.profileUpdated').subscribe((res: string) => {
            this.toastr.success(res);
          });
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.translateService.get('messages.profileUpdateFailed').subscribe((res: string) => {
            this.toastr.error(error.message || res);
          });
        }
      });
  }
}