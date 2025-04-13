import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface Department {
  id: number;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  officerCount: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'Edit' : 'Create' }} Department</h1>
          <a routerLink="/admin/departments" class="text-blue-600 hover:text-blue-800 flex items-center">
            <span class="material-icons mr-1">arrow_back</span>
            Back to Departments
          </a>
        </div>

        <div *ngIf="loading" class="flex justify-center my-8">
          <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
        </div>

        <form *ngIf="!loading" [formGroup]="departmentForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department name"
              >
              <div *ngIf="departmentForm.get('name')?.invalid && departmentForm.get('name')?.touched" class="text-red-600 text-sm mt-1">
                Department name is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                id="location"
                formControlName="location"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department location"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="contactInfo" class="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
            <input
              type="text"
              id="contactInfo"
              formControlName="contactInfo"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact information"
            >
          </div>
          
          <div class="form-group">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter department description"
            ></textarea>
          </div>
          
          <div class="flex justify-end">
            <button
              type="button"
              routerLink="/admin/departments"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [disabled]="departmentForm.invalid || submitting"
            >
              {{ submitting ? 'Saving...' : 'Save Department' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;
  departmentId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.departmentId = +id;
      this.loadDepartment(this.departmentId);
    }
  }

  initForm(): void {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      location: [''],
      contactInfo: ['']
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
          console.error('Error loading department:', error);
          this.toastr.error('Failed to load department');
          this.loading = false;
          this.router.navigate(['/admin/departments']);
        }
      });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const departmentData = this.departmentForm.value;

    const request = this.isEditMode
      ? this.http.put<Department>(`${environment.apiUrl}/admin/departments/${this.departmentId}`, departmentData)
      : this.http.post<Department>(`${environment.apiUrl}/admin/departments`, departmentData);

    request.subscribe({
      next: () => {
        this.toastr.success(`Department ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/admin/departments']);
      },
      error: (error) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} department:`, error);
        this.toastr.error(`Failed to ${this.isEditMode ? 'update' : 'create'} department`);
        this.submitting = false;
      }
    });
  }
} 