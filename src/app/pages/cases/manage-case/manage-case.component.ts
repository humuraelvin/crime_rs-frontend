import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CaseService } from '../../../core/services/case.service';
import { AuthService } from '../../../core/services/auth.service';

interface CaseStatus {
  value: string;
  label: string;
}

@Component({
  selector: 'app-manage-case',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Update Case' : 'New Case' }}</h2>
            <button (click)="onCancel()" class="text-gray-600 hover:text-gray-800">
              <span class="sr-only">Cancel</span>
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="caseForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">Case Title</label>
              <input type="text" id="title" formControlName="title"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <div *ngIf="caseForm.get('title')?.touched && caseForm.get('title')?.errors?.['required']"
                   class="mt-1 text-sm text-red-600">
                Case title is required
              </div>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Case Description</label>
              <textarea id="description" formControlName="description" rows="4"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
              <div *ngIf="caseForm.get('description')?.touched && caseForm.get('description')?.errors?.['required']"
                   class="mt-1 text-sm text-red-600">
                Case description is required
              </div>
            </div>

            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" formControlName="status"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option *ngFor="let status of caseStatuses" [value]="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
              <select id="priority" formControlName="priority"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label for="assignedOfficer" class="block text-sm font-medium text-gray-700">Assigned Officer</label>
              <input type="text" id="assignedOfficer" formControlName="assignedOfficer"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700">Investigation Notes</label>
              <textarea id="notes" formControlName="notes" rows="4"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Add any relevant investigation notes..."></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Evidence Files</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload"
                           class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload evidence</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only" multiple (change)="onFileSelected($event)">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PDF, Images, Documents up to 10MB each</p>
                </div>
              </div>
              <div *ngIf="selectedFiles.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                <ul class="space-y-2">
                  <li *ngFor="let file of selectedFiles; let i = index" 
                      class="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span>{{ file.name }}</span>
                    <button type="button" (click)="removeFile(i)" 
                            class="text-red-500 hover:text-red-700">
                      Remove
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button type="button" (click)="onCancel()"
                      class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancel
              </button>
              <button type="submit"
                      [disabled]="caseForm.invalid || isSubmitting"
                      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Case' : 'Create Case') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ManageCaseComponent implements OnInit {
  caseForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  selectedFiles: File[] = [];
  caseId: string | null = null;

  caseStatuses: CaseStatus[] = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  constructor(
    private fb: FormBuilder,
    private caseService: CaseService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.caseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      status: ['OPEN', Validators.required],
      priority: ['MEDIUM', Validators.required],
      assignedOfficer: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isPoliceOfficer()) {
      this.toastr.error('Unauthorized access');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.caseId = params['id'];
        this.loadCaseData(this.caseId);
      }
    });
  }

  private loadCaseData(caseId: string): void {
    this.caseService.getCaseById(caseId).subscribe({
      next: (caseData) => {
        this.caseForm.patchValue({
          title: caseData.title,
          description: caseData.description,
          status: caseData.status,
          priority: caseData.priority,
          assignedOfficer: caseData.assignedOfficer,
          notes: caseData.notes
        });
      },
      error: (error) => {
        this.toastr.error('Failed to load case data');
        this.router.navigate(['/cases']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const invalidFiles = files.filter(file => {
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        const isValidType = /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name);
        return !isValidSize || !isValidType;
      });

      if (invalidFiles.length > 0) {
        invalidFiles.forEach(file => {
          const reason = file.size > 10 * 1024 * 1024 ? 'File size exceeds 10MB' : 'Invalid file type';
          this.toastr.error(`${file.name}: ${reason}`);
        });
        return;
      }

      this.selectedFiles.push(...files);
      this.toastr.success(`${files.length} file(s) selected successfully`);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.caseForm.valid) {
      this.isSubmitting = true;
      const formData = new FormData();
      const caseData = this.caseForm.value;

      // Append form fields to FormData
      Object.keys(caseData).forEach(key => {
        formData.append(key, caseData[key]);
      });

      // Append files
      this.selectedFiles.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });

      const request = this.isEditMode ?
        this.caseService.updateCase(this.caseId!, formData) :
        this.caseService.createCase(formData);

      request.subscribe({
        next: (response) => {
          this.toastr.success(`Case ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/cases']);
        },
        error: (error) => {
          this.toastr.error(error.message || `Failed to ${this.isEditMode ? 'update' : 'create'} case`);
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.toastr.error('Please fill in all required fields correctly');
      Object.keys(this.caseForm.controls).forEach(key => {
        const control = this.caseForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/cases']);
  }
} 