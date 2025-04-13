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
}

interface PoliceOfficer {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  badgeNumber: string;
  departmentId: number;
  departmentName: string;
  rank: string;
  specialization: string;
  contactInfo: string;
  jurisdiction: string;
  activeCasesCount: number;
}

@Component({
  selector: 'app-officer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'Edit' : 'Create' }} Police Officer</h1>
          <a routerLink="/admin/officers" class="text-blue-600 hover:text-blue-800 flex items-center">
            <span class="material-icons mr-1">arrow_back</span>
            Back to Officers
          </a>
        </div>

        <div *ngIf="loading" class="flex justify-center my-8">
          <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
        </div>

        <form *ngIf="!loading" [formGroup]="officerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="border-b border-gray-200 pb-4 mb-4">
            <h2 class="text-lg font-semibold text-gray-700 mb-3">Personal Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                >
                <div *ngIf="officerForm.get('firstName')?.invalid && officerForm.get('firstName')?.touched" class="text-red-600 text-sm mt-1">
                  First name is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                >
                <div *ngIf="officerForm.get('lastName')?.invalid && officerForm.get('lastName')?.touched" class="text-red-600 text-sm mt-1">
                  Last name is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  [readOnly]="isEditMode"
                >
                <div *ngIf="officerForm.get('email')?.errors?.['required'] && officerForm.get('email')?.touched" class="text-red-600 text-sm mt-1">
                  Email is required
                </div>
                <div *ngIf="officerForm.get('email')?.errors?.['email'] && officerForm.get('email')?.touched" class="text-red-600 text-sm mt-1">
                  Please enter a valid email address
                </div>
              </div>
              
              <div class="form-group">
                <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  formControlName="phoneNumber"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                >
              </div>
              
              <div class="form-group" *ngIf="!isEditMode">
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  id="password"
                  formControlName="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                >
                <div *ngIf="officerForm.get('password')?.invalid && officerForm.get('password')?.touched" class="text-red-600 text-sm mt-1">
                  Password is required (minimum 8 characters)
                </div>
              </div>
            </div>
          </div>
          
          <div class="border-b border-gray-200 pb-4 mb-4">
            <h2 class="text-lg font-semibold text-gray-700 mb-3">Officer Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="badgeNumber" class="block text-sm font-medium text-gray-700 mb-1">Badge Number *</label>
                <input
                  type="text"
                  id="badgeNumber"
                  formControlName="badgeNumber"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter badge number"
                >
                <div *ngIf="officerForm.get('badgeNumber')?.invalid && officerForm.get('badgeNumber')?.touched" class="text-red-600 text-sm mt-1">
                  Badge number is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="departmentId" class="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  id="departmentId"
                  formControlName="departmentId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option [ngValue]="null" disabled>Select department</option>
                  <option *ngFor="let dept of departments" [ngValue]="dept.id">{{ dept.name }}</option>
                </select>
                <div *ngIf="officerForm.get('departmentId')?.invalid && officerForm.get('departmentId')?.touched" class="text-red-600 text-sm mt-1">
                  Department is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="rank" class="block text-sm font-medium text-gray-700 mb-1">Rank *</label>
                <input
                  type="text"
                  id="rank"
                  formControlName="rank"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rank"
                >
                <div *ngIf="officerForm.get('rank')?.invalid && officerForm.get('rank')?.touched" class="text-red-600 text-sm mt-1">
                  Rank is required
                </div>
              </div>
              
              <div class="form-group">
                <label for="specialization" class="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  id="specialization"
                  formControlName="specialization"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter specialization"
                >
              </div>
              
              <div class="form-group md:col-span-2">
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
                <label for="jurisdiction" class="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                <input
                  type="text"
                  id="jurisdiction"
                  formControlName="jurisdiction"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter jurisdiction"
                >
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button
              type="button"
              routerLink="/admin/officers"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [disabled]="officerForm.invalid || submitting"
            >
              {{ submitting ? 'Saving...' : 'Save Officer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class OfficerFormComponent implements OnInit {
  officerForm!: FormGroup;
  isEditMode = false;
  officerId: number | null = null;
  loading = false;
  submitting = false;
  departments: Department[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.officerId = +id;
    }
    
    this.initForm();
    
    if (this.isEditMode) {
      this.loadOfficer(this.officerId!);
    }
  }

  initForm(): void {
    this.officerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: this.isEditMode ? null : ['', [Validators.required, Validators.minLength(8)]],
      badgeNumber: ['', [Validators.required]],
      departmentId: [null, [Validators.required]],
      rank: ['', [Validators.required]],
      specialization: [''],
      contactInfo: [''],
      jurisdiction: ['']
    });
  }

  loadDepartments(): void {
    this.loading = true;
    this.http.get<Department[]>(`${environment.apiUrl}/admin/departments`)
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          if (!this.isEditMode) {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.toastr.error('Failed to load departments');
          if (!this.isEditMode) {
            this.loading = false;
          }
        }
      });
  }

  loadOfficer(id: number): void {
    this.http.get<PoliceOfficer>(`${environment.apiUrl}/admin/officers/${id}`)
      .subscribe({
        next: (officer) => {
          this.officerForm.patchValue({
            firstName: officer.firstName,
            lastName: officer.lastName,
            email: officer.email,
            phoneNumber: officer.phoneNumber,
            badgeNumber: officer.badgeNumber,
            departmentId: officer.departmentId,
            rank: officer.rank,
            specialization: officer.specialization,
            contactInfo: officer.contactInfo,
            jurisdiction: officer.jurisdiction
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading officer:', error);
          this.toastr.error('Failed to load officer');
          this.loading = false;
          this.router.navigate(['/admin/officers']);
        }
      });
  }

  onSubmit(): void {
    if (this.officerForm.invalid) {
      this.officerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const officerData = { ...this.officerForm.value };
    
    // Remove password if it's null or empty (edit mode)
    if (!officerData.password) {
      delete officerData.password;
    }

    const request = this.isEditMode
      ? this.http.put<PoliceOfficer>(`${environment.apiUrl}/admin/officers/${this.officerId}`, officerData)
      : this.http.post<PoliceOfficer>(`${environment.apiUrl}/admin/officers`, officerData);

    request.subscribe({
      next: () => {
        this.toastr.success(`Officer ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/admin/officers']);
      },
      error: (error) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} officer:`, error);
        
        // Handle specific error messages from the server
        if (error.error?.message?.includes('Email is already in use')) {
          this.toastr.error('Email address is already in use');
        } else if (error.error?.message?.includes('Badge number is already in use')) {
          this.toastr.error('Badge number is already in use');
        } else {
          this.toastr.error(`Failed to ${this.isEditMode ? 'update' : 'create'} officer`);
        }
        
        this.submitting = false;
      }
    });
  }
} 