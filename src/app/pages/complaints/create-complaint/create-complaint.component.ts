import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService, ComplaintRequest } from '../../../core/services/complaint.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '@environments/environment';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-create-complaint',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Report a Crime</h2>
            <button (click)="onCancel()" class="text-gray-600 hover:text-gray-800">
              <span class="sr-only">Cancel</span>
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="complaintForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700">Type of Crime</label>
              <select id="type" formControlName="type"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select type</option>
                <option value="THEFT">Theft</option>
                <option value="ASSAULT">Assault</option>
                <option value="VANDALISM">Vandalism</option>
                <option value="FRAUD">Fraud</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="OTHER">Other</option>
              </select>
              <div *ngIf="complaintForm.get('type')?.touched && complaintForm.get('type')?.errors?.['required']"
                   class="mt-1 text-sm text-red-600">
                Please select the type of crime
              </div>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" formControlName="description" rows="4"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Please provide detailed information about the incident..."></textarea>
              <div *ngIf="complaintForm.get('description')?.touched && complaintForm.get('description')?.errors?.['required']"
                   class="mt-1 text-sm text-red-600">
                Description is required
              </div>
              <div *ngIf="complaintForm.get('description')?.touched && complaintForm.get('description')?.errors?.['minlength']"
                   class="mt-1 text-sm text-red-600">
                Description must be at least 20 characters
              </div>
            </div>

            <div>
              <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" id="location" formControlName="location"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                     placeholder="Enter the location of the incident">
              <div *ngIf="complaintForm.get('location')?.touched && complaintForm.get('location')?.errors?.['required']"
                   class="mt-1 text-sm text-red-600">
                Location is required
              </div>
            </div>

            <div>
              <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
              <select id="priority" formControlName="priority"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Evidence (Optional)</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg *ngIf="!selectedFile" class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  
                  <div *ngIf="selectedFile" class="flex flex-col items-center">
                    <div class="flex items-center space-x-2">
                      <svg class="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="text-sm text-gray-700">{{ selectedFile.name }}</span>
                    </div>
                    <span class="text-xs text-gray-500 mt-1">{{ formatFileSize(selectedFile.size) }}</span>
                    <button type="button" (click)="removeSelectedFile()" class="text-red-500 text-xs mt-2">Remove</button>
                  </div>
                  
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload"
                           class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>{{ selectedFile ? 'Change file' : 'Upload a file' }}</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only" (change)="onFileSelected($event)">
                    </label>
                    <p class="pl-1" *ngIf="!selectedFile">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button type="button" (click)="onCancel()"
                      class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancel
              </button>
              <button type="submit"
                      [disabled]="complaintForm.invalid || isSubmitting"
                      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                <span *ngIf="isSubmitting" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ uploadProgress > 0 ? uploadProgress + '% Uploading...' : 'Submitting...' }}
                </span>
                <span *ngIf="!isSubmitting">Submit Report</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CreateComplaintComponent implements OnInit {
  complaintForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  uploadProgress = 0;

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {
    this.complaintForm = this.fb.group({
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      location: ['', Validators.required],
      priority: ['MEDIUM', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.toastr.error('Please login to report a crime');
      this.router.navigate(['/auth/login']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error('File size should not exceed 10MB');
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      this.selectedFile = file;
      this.toastr.success('File selected successfully');
    }
  }
  
  removeSelectedFile(): void {
    this.selectedFile = null;
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.complaintForm.valid) {
      this.isSubmitting = true;
      this.uploadProgress = 0;
      
      const complaintData = this.complaintForm.value;
      
      // Check if user is still authenticated
      if (!this.authService.isAuthenticated()) {
        this.toastr.error('Your session has expired. Please log in again.');
        this.router.navigate(['/auth/login']);
        this.isSubmitting = false;
        return;
      }
      
      // Create the complaint request with ONLY the fields the backend expects
      const complaintRequest: ComplaintRequest = {
        type: complaintData.type,
        description: complaintData.description,
        location: complaintData.location,
        priority: complaintData.priority,
        evidenceFiles: this.selectedFile ? [this.selectedFile] : undefined,
        
        fullName: this.authService.currentUserValue?.firstName + ' ' + this.authService.currentUserValue?.lastName || '',
        contact: this.authService.currentUserValue?.phoneNumber || '',
        email: this.authService.currentUserValue?.email || '',
        incidentDate: new Date().toISOString()
      };
      
      console.log('Submitting complaint:', complaintRequest);
      
      // Check if token needs refresh, and refresh if necessary before submitting
      const token = this.authService.currentUserValue?.accessToken;
      
      if (token) {
        try {
          // Parse the JWT to check if it's about to expire
          const tokenData = this.parseJwt(token);
          const expiryTime = tokenData?.exp ? new Date(tokenData.exp * 1000) : null;
          const now = new Date();
          
          // If token is expired or expires in less than 1 minute, refresh it first
          if (!expiryTime || expiryTime.getTime() - now.getTime() < 60000) {
            console.log('Token is about to expire, refreshing first...');
            
            this.authService.refreshToken().subscribe({
              next: () => {
                console.log('Token refreshed successfully, proceeding with complaint submission');
                this.proceedWithComplaintSubmission(complaintRequest);
              },
              error: (error) => {
                console.error('Failed to refresh token:', error);
                this.toastr.error('Your session has expired. Please log in again.');
                this.isSubmitting = false;
                this.router.navigate(['/auth/login']);
              }
            });
          } else {
            // Token is valid, proceed directly
            this.proceedWithComplaintSubmission(complaintRequest);
          }
        } catch (e) {
          console.error('Error parsing token:', e);
          // If we can't parse the token, try to submit anyway
          this.proceedWithComplaintSubmission(complaintRequest);
        }
      } else {
        // No token, can't proceed
        this.toastr.error('You must be logged in to submit a complaint');
        this.isSubmitting = false;
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.log('Form is invalid:', this.complaintForm.errors);
      this.toastr.error('Please fill in all required fields correctly');
      Object.keys(this.complaintForm.controls).forEach(key => {
        const control = this.complaintForm.get(key);
        if (control?.invalid) {
          console.log(`Invalid field: ${key}`, control.errors);
          control.markAsTouched();
        }
      });
    }
  }
  
  // Helper method to parse JWT tokens
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  }
  
  // Helper method to actually submit the complaint after token checks
  private proceedWithComplaintSubmission(complaint: ComplaintRequest): void {
    // Check if we're submitting with a file
    if (this.selectedFile) {
      // Use a direct XHR call for file uploads
      this.submitWithXHR(complaint);
    } else {
      // Use the regular service for non-file complaints
      this.complaintService.createComplaint(complaint).subscribe({
        next: (response) => {
          console.log('Complaint created successfully:', response);
          this.toastr.success('Crime report submitted successfully');
          this.isSubmitting = false;
          this.router.navigate(['/complaints']);
        },
        error: (error) => {
          console.error('Error submitting complaint:', error);
          this.toastr.error(error.message || 'Failed to submit crime report');
          this.isSubmitting = false;
        }
      });
    }
  }
  
  // Manual XHR approach to work around the 403 issue
  private submitWithXHR(complaint: ComplaintRequest): void {
    // First check authentication
    if (!this.authService.isAuthenticated()) {
      this.toastr.error('Please log in to submit a complaint');
      this.router.navigate(['/auth/login']);
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    // Add all required fields to FormData
    formData.append('type', complaint.type);
    formData.append('description', complaint.description);
    formData.append('location', complaint.location);
    formData.append('priority', complaint.priority || 'MEDIUM');
    
    // Add the required user fields
    formData.append('fullName', complaint.fullName);
    formData.append('contact', complaint.contact);
    formData.append('email', complaint.email);
    formData.append('incidentDate', complaint.incidentDate);
    
    // Add file if available
    if (complaint.evidenceFiles && complaint.evidenceFiles.length > 0) {
      formData.append('files', complaint.evidenceFiles[0]);
    }
    
    // Set up progress tracking
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        this.uploadProgress = progress;
        this.ngZone.run(() => {}); // Trigger change detection
      }
    };
    
    // Handle response
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        this.ngZone.run(() => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('XHR Success:', xhr.responseText);
            this.uploadProgress = 100;
            this.toastr.success('Crime report submitted successfully');
            this.isSubmitting = false;
            this.router.navigate(['/complaints']);
          } else {
            console.error('XHR Error:', xhr.status, xhr.statusText, xhr.responseText);
            
            let errorMsg = 'Failed to submit report';
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse && errorResponse.message) {
                errorMsg = errorResponse.message;
              }
            } catch (e) {
              if (xhr.status === 403) {
                // Try to refresh token and retry
                this.authService.refreshToken().subscribe({
                  next: () => {
                    // Retry submission after token refresh
                    this.proceedWithComplaintSubmission(complaint);
                  },
                  error: () => {
                    this.toastr.error('Your session has expired. Please log in again.');
                    this.router.navigate(['/auth/login']);
                  }
                });
                return;
              } else if (xhr.status === 401) {
                errorMsg = 'Your session has expired. Please log in again.';
                this.router.navigate(['/auth/login']);
              } else {
                errorMsg = `Failed to submit report (${xhr.status})`;
              }
            }
            
            this.toastr.error(errorMsg);
            this.isSubmitting = false;
            this.uploadProgress = 0;
          }
        });
      }
    };
    
    // Get API URL from environment 
    const apiUrl = `${environment.apiUrl}/complaints/with-evidence`;
    
    // Get authorization header
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      this.toastr.error('Authentication required');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Open and send request
    xhr.open('POST', apiUrl, true);
    
    // Set auth header
    xhr.setRequestHeader('Authorization', authHeader);
    
    // Set accept header
    xhr.setRequestHeader('Accept', 'application/json');
    
    // Try to get CSRF token if it exists in cookies
    const getCsrfToken = (): string | null => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN' || name === 'csrf-token' || name === 'X-CSRF-TOKEN') {
          return value;
        }
      }
      return null;
    };
    
    // Add CSRF token header if available
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
    }
    
    // Send the form data
    xhr.send(formData);
  }

  onCancel(): void {
    this.router.navigate(['/complaints']);
  }
} 