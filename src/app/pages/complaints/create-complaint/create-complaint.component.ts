import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ComplaintService, ComplaintCreateRequest, ComplaintResponse } from '../../../core/services/complaint.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '@environments/environment';
import { NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create-complaint',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
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
  apiUrl: string;
  isEditMode = false;
  complaintId: number | null = null;
  existingComplaint: ComplaintResponse | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private complaintService: ComplaintService,
    private toastr: ToastrService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl;
  }

  ngOnInit() {
    this.initForm();
    
    // Get current user ID
    const user = this.authService.currentUserValue;
    if (user && user.id) {
      this.userId = user.id;
    } else {
      this.toastr.error('User information not found. Please log in again.');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id) {
        this.isEditMode = true;
        this.complaintId = +id;
        this.loadComplaint(this.complaintId);
      }
    });
  }

  loadComplaint(id: number) {
    this.loading = true;
    this.complaintService.getComplaintById(id).subscribe({
      next: (complaint) => {
        this.existingComplaint = complaint;
        
        // Check if this complaint belongs to the current user
        if (complaint.userId !== this.userId) {
          this.toastr.error('You can only edit your own complaints.');
          this.router.navigate(['/complaints']);
          return;
        }
        
        // Check if complaint is in editable state
        if (complaint.status !== 'SUBMITTED') {
          this.toastr.warning('You can only edit complaints in SUBMITTED status.');
          this.router.navigate(['/complaints', id]);
          return;
        }
        
        // Populate form with complaint data
        this.complaintForm.patchValue({
          crimeType: complaint.crimeType,
          location: complaint.location,
          description: complaint.description,
          priority: (complaint as any).priority || 'MEDIUM'
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading complaint:', error);
        this.toastr.error('Failed to load complaint details.');
        this.router.navigate(['/complaints']);
        this.loading = false;
      }
    });
  }

  initForm() {
    this.complaintForm = this.formBuilder.group({
      crimeType: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      priority: ['MEDIUM']
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
      priority: this.complaintForm.value.priority,
      evidenceFiles: this.selectedFile ? [this.selectedFile] : undefined
    };

    if (this.isEditMode && this.complaintId) {
      this.updateComplaint(complaintData);
    } else {
      if (this.selectedFile) {
        // If there's a file, use the endpoint that handles files
        this.submitWithEvidence(complaintData);
      } else {
        // Otherwise, use the regular endpoint
        this.submitComplaint(complaintData);
      }
    }
  }

  private updateComplaint(complaintData: ComplaintCreateRequest): void {
    if (!this.complaintId) {
      this.handleError(new Error('Complaint ID is missing'));
      return;
    }

    if (this.selectedFile) {
      // First update the complaint details, then upload the evidence
      this.complaintService.updateComplaint({
        id: this.complaintId,
        description: complaintData.description,
        location: complaintData.location,
        crimeType: complaintData.crimeType,
        userId: complaintData.userId
      }).pipe(
        switchMap(response => {
          // After updating complaint, upload evidence
          if (this.selectedFile) {
            return this.uploadEvidenceForComplaint(this.complaintId!, this.selectedFile);
          }
          return of(response);
        })
      ).subscribe({
        next: (response) => {
          this.handleSuccess(this.complaintId!);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    } else {
      // Only update complaint details without evidence
      this.complaintService.updateComplaint({
        id: this.complaintId,
        description: complaintData.description,
        location: complaintData.location,
        crimeType: complaintData.crimeType,
        userId: complaintData.userId
      }).subscribe({
        next: (response) => {
          this.handleSuccess(this.complaintId!);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  private uploadEvidenceForComplaint(complaintId: number, file: File) {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('complaintId', complaintId.toString());

    const headers = {
      'Authorization': `Bearer ${this.authService.getToken()}`
    };

    return this.http.post<any>(`${this.apiUrl}/complaints/upload-evidence`, formData, { headers });
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
    formData.append('priority', complaintData.priority || 'MEDIUM');

    if (complaintData.evidenceFiles && complaintData.evidenceFiles.length > 0) {
      complaintData.evidenceFiles.forEach((file, index) => {
        formData.append('files', file);
      });
    }

    const headers = {
      'Authorization': `Bearer ${this.authService.getToken()}`
    };

    this.http.post<any>(`${this.apiUrl}/complaints/with-evidence`, formData, { headers })
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
    this.loading = false;
    this.isSubmitting = false;
    
    if (this.isEditMode) {
      this.toastr.success('Complaint updated successfully!');
    } else {
      this.toastr.success('Complaint submitted successfully!');
    }
    
    this.router.navigate(['/complaints', complaintId]);
  }

  private handleError(error: any): void {
    this.loading = false;
    this.isSubmitting = false;
    console.error('Error with complaint:', error);
    this.toastr.error(error.message || `Failed to ${this.isEditMode ? 'update' : 'submit'} complaint. Please try again.`);
  }

  onCancel(): void {
    if (this.isEditMode && this.complaintId) {
      this.router.navigate(['/complaints', this.complaintId]);
    } else {
      this.router.navigate(['/complaints']);
    }
  }
} 