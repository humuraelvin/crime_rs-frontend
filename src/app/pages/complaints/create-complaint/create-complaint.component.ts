import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService, ComplaintCreateRequest } from '../../../core/services/complaint.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '@environments/environment';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-create-complaint',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-complaint.component.html',
  styles: []
})
export class CreateComplaintComponent implements OnInit {
  complaintForm!: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  loading = false;
  submitted = false;
  userId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private complaintService: ComplaintService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
    
    // Get current user ID
    const user = this.authService.currentUserValue;
    if (user && user.id) {
      this.userId = user.id;
    } else {
      this.toastr.error('User information not found. Please log in again.');
      this.router.navigate(['/auth/login']);
    }
  }

  initForm() {
    this.complaintForm = this.formBuilder.group({
      crimeType: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  // Getter for easy access to form fields
  get f() { return this.complaintForm.controls; }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
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

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.complaintForm.invalid) {
      this.toastr.error('Please correct the errors in the form before submitting.');
      return;
    }

    if (!this.userId) {
      this.toastr.error('User information not found. Please log in again.');
      return;
    }

    this.loading = true;

    const complaintData: ComplaintCreateRequest = {
      userId: this.userId,
      crimeType: this.complaintForm.value.crimeType,
      description: this.complaintForm.value.description,
      location: this.complaintForm.value.location,
      evidenceFiles: this.selectedFile ? [this.selectedFile] : undefined
    };

    if (this.selectedFile) {
      // If there's a file, use the endpoint that handles files
      this.submitWithEvidence(complaintData);
    } else {
      // Otherwise, use the regular endpoint
      this.submitComplaint(complaintData);
    }
  }

  private submitComplaint(complaintData: ComplaintCreateRequest): void {
    this.complaintService.createComplaint(complaintData)
      .subscribe({
        next: (response) => {
          this.handleSuccess(response.id);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  private submitWithEvidence(complaintData: ComplaintCreateRequest): void {
    // Create FormData for submitting files
    const formData = new FormData();
    formData.append('type', complaintData.crimeType);
    formData.append('description', complaintData.description);
    formData.append('location', complaintData.location);

    // Add the file if it exists
    if (complaintData.evidenceFiles && complaintData.evidenceFiles.length > 0) {
      formData.append('files', complaintData.evidenceFiles[0]);
    }

    // Use a specialized service method for file uploads if available
    // For now, using the regular method
    this.complaintService.createComplaint(complaintData)
      .subscribe({
        next: (response) => {
          this.handleSuccess(response.id);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  private handleSuccess(complaintId: number): void {
    this.isSubmitting = false;
    this.toastr.success('Complaint submitted successfully!');
    this.router.navigate(['/complaints', complaintId]);
  }

  private handleError(error: any): void {
    this.isSubmitting = false;
    console.error('Error submitting complaint:', error);
    this.toastr.error(error.message || 'Failed to submit complaint. Please try again.');
  }

  onCancel(): void {
    this.router.navigate(['/complaints']);
  }
} 