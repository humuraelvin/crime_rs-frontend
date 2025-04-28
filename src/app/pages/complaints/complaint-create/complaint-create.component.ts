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
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-semibold text-gray-900">Report a Crime</h1>
            <a
              routerLink="/complaints"
              class="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition duration-200"
            >
              <span class="material-icons mr-1">arrow_back</span>
              Back to Complaints
            </a>
          </div>

          <div class="bg-white shadow-md rounded-xl p-8">
            <form [formGroup]="complaintForm" (ngSubmit)="submitComplaint()" class="space-y-6">
              <div>
                <label for="crimeType" class="block text-sm font-semibold text-gray-700 mb-2">Crime Type</label>
                <select
                  id="crimeType"
                  formControlName="crimeType"
                  class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
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
                <div *ngIf="submitted && f['crimeType'].errors" class="text-sm text-red-600 mt-2">
                  <div *ngIf="f['crimeType'].errors['required']">Crime type is required</div>
                </div>
              </div>

              <div>
                <label for="location" class="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  id="location"
                  formControlName="location"
                  class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                  placeholder="Where did the incident take place?"
                >
                <div *ngIf="submitted && f['location'].errors" class="text-sm text-red-600 mt-2">
                  <div *ngIf="f['location'].errors['required']">Location is required</div>
                </div>
              </div>

              <div>
                <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  id="description"
                  formControlName="description"
                  rows="5"
                  class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200 resize-y"
                  placeholder="Please describe what happened in detail"
                ></textarea>
                <div *ngIf="submitted && f['description'].errors" class="text-sm text-red-600 mt-2">
                  <div *ngIf="f['description'].errors['required']">Description is required</div>
                  <div *ngIf="f['description'].errors['minlength']">Description must be at least 20 characters</div>
                </div>
              </div>

              <div class="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  routerLink="/complaints"
                  class="px-4 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200 flex items-center"
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
  styles: [`
    :host {
      display: block;
    }

    /* Ensure the form container is responsive */
    .max-w-2xl {
      max-width: 42rem;
    }

    /* Enhance form controls */
    input, select, textarea {
      font-size: 0.875rem;
      line-height: 1.5;
      border-width: 1px;
    }

    /* Improve textarea resizing */
    textarea {
      resize: vertical;
    }

    /* Button disabled state */
    button:disabled {
      opacity: 0.7;
    }

    /* Add subtle shadow to form container */
    .shadow-md {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Improve link hover effect */
    a:hover {
      text-decoration: underline;
    }

    /* Ensure material icons align properly */
    .material-icons {
      font-size: 1.25rem;
      line-height: 1;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .max-w-2xl {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      .flex.justify-between {
        flex-direction: column;
        gap: 1rem;
      }
      .space-x-4 {
        flex-direction: column;
        gap: 1rem;
      }
      button {
        width: 100%;
      }
    }
  `]
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
