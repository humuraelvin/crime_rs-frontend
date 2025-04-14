import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ComplaintService, ComplaintCreateRequest } from '../../../core/services/complaint.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-complaint-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  // Keep existing template
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Report a Crime</h1>
            <button 
              routerLink="/complaints" 
              class="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <span class="material-icons mr-1">arrow_back</span>
              Back to Complaints
            </button>
          </div>
          
          <div class="bg-white shadow-md rounded-lg p-6">
            <form [formGroup]="complaintForm" (ngSubmit)="submitComplaint()">
              <div class="mb-6">
                <label for="crimeType" class="block text-sm font-medium text-gray-700 mb-1">Crime Type</label>
                <select 
                  id="crimeType" 
                  formControlName="crimeType"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Crime Type</option>
                  <option value="THEFT">Theft</option>
                  <option value="ASSAULT">Assault</option>
                  <option value="BURGLARY">Burglary</option>
                  <option value="FRAUD">Fraud</option>
                  <option value="VANDALISM">Vandalism</option>
                  <option value="HARASSMENT">Harassment</option>
                  <option value="DRUG_RELATED">Drug Related</option>
                  <option value="OTHER">Other</option>
                </select>
                <div *ngIf="submitted && f['crimeType'].errors" class="text-red-500 text-xs mt-1">
                  <div *ngIf="f['crimeType'].errors['required']">Crime type is required</div>
                </div>
              </div>
              
              <div class="mb-6">
                <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  id="location" 
                  formControlName="location"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Where did the incident take place?"
                >
                <div *ngIf="submitted && f['location'].errors" class="text-red-500 text-xs mt-1">
                  <div *ngIf="f['location'].errors['required']">Location is required</div>
                </div>
              </div>
              
              <div class="mb-6">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  id="description" 
                  formControlName="description"
                  rows="5"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Please describe what happened in detail"
                ></textarea>
                <div *ngIf="submitted && f['description'].errors" class="text-red-500 text-xs mt-1">
                  <div *ngIf="f['description'].errors['required']">Description is required</div>
                  <div *ngIf="f['description'].errors['minlength']">Description must be at least 20 characters</div>
                </div>
              </div>

              <div class="flex justify-end space-x-4">
                <button 
                  type="button"
                  routerLink="/complaints"
                  class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  [disabled]="isSubmitting"
                >
                  <span *ngIf="isSubmitting" class="mr-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Submit Report
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
export class ComplaintCreateComponent implements OnInit {
  complaintForm!: FormGroup;
  isSubmitting = false;
  submitted = false;
  userId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Get current user ID for associating with the complaint
    const user = this.authService.currentUserValue;
    if (user && user.id) {
      this.userId = user.id;
    } else {
      this.toastr.error('User information not found. Please log in again.');
      this.router.navigate(['/auth/login']);
    }
  }

  initForm(): void {
    this.complaintForm = this.formBuilder.group({
      crimeType: ['', [Validators.required]],
      location: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  get f() {
    return this.complaintForm.controls;
  }

  submitComplaint(): void {
    this.submitted = true;
    
    // Stop here if form is invalid
    if (this.complaintForm.invalid) {
      this.toastr.error('Please correct the errors in the form before submitting.');
      return;
    }
    
    if (!this.userId) {
      this.toastr.error('User information not found. Please log in again.');
      return;
    }
    
    this.isSubmitting = true;
    
    const complaintData: ComplaintCreateRequest = {
      userId: this.userId,
      crimeType: this.complaintForm.value.crimeType,
      description: this.complaintForm.value.description,
      location: this.complaintForm.value.location
    };
    
    this.complaintService.createComplaint(complaintData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.toastr.success('Complaint submitted successfully!');
        this.router.navigate(['/complaints', response.id]);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error submitting complaint:', error);
        this.toastr.error(error.message || 'Failed to submit complaint. Please try again.');
      }
    });
  }
} 