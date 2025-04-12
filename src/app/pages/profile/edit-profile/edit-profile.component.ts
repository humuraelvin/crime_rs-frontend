import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container my-4">
      <div class="mb-3">
        <a routerLink="/profile" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Back to Profile
        </a>
      </div>
      
      <h2>Edit Profile</h2>
      
      <form #profileForm="ngForm" (ngSubmit)="profileForm.valid && onSubmit()">
        <div class="card mb-3">
          <div class="card-header">Personal Information</div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="firstName" 
                  name="firstName"
                  [(ngModel)]="profileData.firstName"
                  required
                  #firstName="ngModel"
                >
                <div *ngIf="firstName.invalid && (firstName.dirty || firstName.touched)" class="text-danger">
                  First name is required
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="lastName" 
                  name="lastName"
                  [(ngModel)]="profileData.lastName"
                  required
                  #lastName="ngModel"
                >
                <div *ngIf="lastName.invalid && (lastName.dirty || lastName.touched)" class="text-danger">
                  Last name is required
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card mb-3">
          <div class="card-header">Contact Information</div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  name="email"
                  [(ngModel)]="profileData.email"
                  required
                  email
                  #email="ngModel"
                >
                <div *ngIf="email.invalid && (email.dirty || email.touched)" class="text-danger">
                  <span *ngIf="email.errors?.['required']">Email is required</span>
                  <span *ngIf="email.errors?.['email']">Please enter a valid email</span>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label for="phone" class="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone" 
                  name="phone"
                  [(ngModel)]="profileData.phone"
                  pattern="[0-9]{10}"
                  #phone="ngModel"
                >
                <div *ngIf="phone.invalid && (phone.dirty || phone.touched)" class="text-danger">
                  Please enter a valid 10-digit phone number
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="address" class="form-label">Address</label>
              <textarea 
                class="form-control" 
                id="address" 
                name="address"
                [(ngModel)]="profileData.address"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="card mb-3">
          <div class="card-header">Preferences</div>
          <div class="card-body">
            <div class="form-check mb-2">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="emailNotifications" 
                name="emailNotifications"
                [(ngModel)]="profileData.emailNotifications"
              >
              <label class="form-check-label" for="emailNotifications">
                Email Notifications
              </label>
            </div>
            <div class="form-check">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="smsNotifications" 
                name="smsNotifications"
                [(ngModel)]="profileData.smsNotifications"
              >
              <label class="form-check-label" for="smsNotifications">
                SMS Notifications
              </label>
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || isSubmitting">
            <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-header {
      background-color: #f8f9fa;
      font-weight: 500;
    }
    .form-label {
      font-weight: 500;
    }
  `]
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
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.profileData.firstName = currentUser.firstName || '';
      this.profileData.lastName = currentUser.lastName || '';
      this.profileData.email = currentUser.email || '';
      this.profileData.phone = currentUser.phone || '';
      this.profileData.address = currentUser.address || '';
      
      // Use notification properties directly from the User model
      this.profileData.emailNotifications = currentUser.emailNotifications;
      this.profileData.smsNotifications = currentUser.smsNotifications;
    }
  }

  onSubmit(): void {
    this.isSubmitting = true;
    
    this.authService.updateUserProfile(this.profileData)
      .subscribe({
        next: (updatedUser: User) => {
          this.isSubmitting = false;
          this.toastr.success('Profile updated successfully');
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.toastr.error(error.message || 'Failed to update profile. Please try again.');
        }
      });
  }
}