import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

interface Department {
  id?: number;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
}

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-12">
      <div class="bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-semibold text-gray-900">{{ isEditMode ? 'Edit' : 'Create' }} Department</h1>
          <a routerLink="/admin/departments" class="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition duration-200">
            <span class="material-icons mr-1 text-xl">arrow_back</span>
            Back to Departments
          </a>
        </div>

        <div *ngIf="loading" class="flex justify-center my-8">
          <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
        </div>

        <form *ngIf="!loading" [formGroup]="departmentForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">Department Name <span class="text-red-600">*</span></label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              >
              <div *ngIf="submitted && f['name'].errors" class="mt-2 text-sm text-red-600">
                <div *ngIf="f['name'].errors['required']">Name is required</div>
              </div>
            </div>

            <div>
              <label for="location" class="block text-sm font-semibold text-gray-700 mb-2">Location <span class="text-red-600">*</span></label>
              <input
                type="text"
                id="location"
                formControlName="location"
                class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              >
              <div *ngIf="submitted && f['location'].errors" class="mt-2 text-sm text-red-600">
                <div *ngIf="f['location'].errors['required']">Location is required</div>
              </div>
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">Description <span class="text-red-600">*</span></label>
            <textarea
              id="description"
              formControlName="description"
              rows="4"
              class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200 resize-y"
            ></textarea>
            <div *ngIf="submitted && f['description'].errors" class="mt-2 text-sm text-red-600">
              <div *ngIf="f['description'].errors['required']">Description is required</div>
            </div>
          </div>

          <div>
            <label for="contactInfo" class="block text-sm font-semibold text-gray-700 mb-2">Contact Information <span class="text-red-600">*</span></label>
            <textarea
              id="contactInfo"
              formControlName="contactInfo"
              rows="3"
              class="w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200 resize-y"
            ></textarea>
            <div *ngIf="submitted && f['contactInfo'].errors" class="mt-2 text-sm text-red-600">
              <div *ngIf="f['contactInfo'].errors['required']">Contact information is required</div>
            </div>
          </div>

          <div class="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              routerLink="/admin/departments"
              class="py-3 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting"
              class="py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200 flex items-center"
            >
              <span *ngIf="isSubmitting" class="mr-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isEditMode ? 'Update' : 'Create' }} Department
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Ensure the form container is responsive */
    .max-w-3xl {
      max-width: 48rem;
    }

    /* Enhance form controls */
    input, textarea {
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
      .max-w-3xl {
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
      .md\\:grid-cols-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;
  loading = false;
  submitted = false;
  isSubmitting = false;
  departmentId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.departmentId = +params['id'];
        this.isEditMode = true;
        this.loadDepartment(this.departmentId);
      }
    });
  }

  // Getter for easy access to form fields
  get f() { return this.departmentForm.controls; }

  initForm(): void {
    this.departmentForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      contactInfo: ['', [Validators.required]]
    });
  }

  loadDepartment(id: number): void {
    this.loading = true;
    this.http.get<Department>(`${environment.apiUrl}/admin/departments/${id}`)
      .subscribe({
        next: (department) => {
          this.departmentForm.patchValue({
            name: department.name,
            description: department.description,
            location: department.location,
            contactInfo: department.contactInfo
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Failed to load department details');
          console.error('Error loading department:', error);
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.departmentForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const departmentData = this.departmentForm.value as Department;

    if (this.isEditMode && this.departmentId) {
      // Update existing department
      this.http.put<Department>(`${environment.apiUrl}/admin/departments/${this.departmentId}`, departmentData)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toastr.success('Department updated successfully');
            this.router.navigate(['/admin/departments']);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.toastr.error('Failed to update department');
            console.error('Error updating department:', error);
          }
        });
    } else {
      // Create new department
      this.http.post<Department>(`${environment.apiUrl}/admin/departments`, departmentData)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toastr.success('Department created successfully');
            this.router.navigate(['/admin/departments']);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.toastr.error('Failed to create department');
            console.error('Error creating department:', error);
          }
        });
    }
  }
}
