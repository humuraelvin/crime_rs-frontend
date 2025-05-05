import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

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
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, TranslateModule],
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
                <label for="lastName" class="block text-sm coronation-medium text-gray-700 mb-1">Last Name *</label>
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
                <div class="relative">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    id="password"
                    formControlName="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  >
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <div *ngIf="officerForm.get('password')?.invalid && officerForm.get('password')?.touched" class="text-red-600 text-sm mt-1">
                  Password is required (minimum 8 characters)
                </div>
              </div>
              
              <div class="form-group" *ngIf="!isEditMode">
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">{{ 'auth.confirmPassword' | translate }} *</label>
                <div class="relative">
                  <input
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                  >
                  <button
                    type="button"
                    (click)="toggleConfirmPasswordVisibility()"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <span class="material-icons">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <div *ngIf="officerForm.get('confirmPassword')?.invalid && officerForm.get('confirmPassword')?.touched" class="text-red-600 text-sm mt-1">
                  {{ 'validation.confirmPasswordRequired' | translate }}
                </div>
                <div *ngIf="officerForm.get('confirmPassword')?.valid && officerForm.get('password')?.valid && 
                  officerForm.get('password')?.value !== officerForm.get('confirmPassword')?.value" 
                  class="text-red-600 text-sm mt-1">
                  {{ 'validation.passwordsDoNotMatch' | translate }}
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
                  [class.border-red-500]="officerForm.get('departmentId')?.invalid && officerForm.get('departmentId')?.touched"
                >
                  <option [ngValue]="null">Select department</option>
                  <option *ngFor="let dept of departments" [ngValue]="dept.id">
                    {{ dept.name }} (ID: {{dept.id}})
                  </option>
                </select>
                <div *ngIf="officerForm.get('departmentId')?.invalid && officerForm.get('departmentId')?.touched" class="text-red-600 text-sm mt-1">
                  Department is required
                </div>
                <div *ngIf="departments.length === 0" class="text-red-600 text-sm mt-1">
                  No departments available. Please create a department first.
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
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translateService: TranslateService
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
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]],
      badgeNumber: ['', [Validators.required]],
      departmentId: [null, [Validators.required]],
      rank: ['', [Validators.required]],
      specialization: [''],
      contactInfo: [''],
      jurisdiction: ['']
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  loadDepartments(): void {
    this.loading = true;
    this.http.get<Department[]>(`${environment.apiUrl}/admin/departments`)
      .subscribe({
        next: (departments) => {
          console.log('Loaded departments:', JSON.stringify(departments));
          this.departments = departments;
          
          // Verify departments data format
          if (departments.length > 0) {
            console.log('Sample department object:', JSON.stringify(departments[0]));
            console.log('First department ID type:', typeof departments[0].id);
            console.log('First department ID value:', departments[0].id);
          }
          
          // If there are departments, set the first one as default for new officers
          if (departments.length > 0 && !this.isEditMode) {
            // Force department ID to be a number
            this.officerForm.patchValue({
              departmentId: Number(departments[0].id)
            });
            console.log('Default department set to:', departments[0].id);
            console.log('Type in form:', typeof this.officerForm.get('departmentId')?.value);
          } else {
            console.warn('No departments found or edit mode active - no default department set');
          }
          
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
    this.loading = true;
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
      this.markFormGroupTouched(this.officerForm);
      this.toastr.warning('Please fill all required fields correctly');
      return;
    }

    // Check if passwords match when creating a new officer
    if (!this.isEditMode && this.officerForm.get('password')?.value !== this.officerForm.get('confirmPassword')?.value) {
      this.toastr.error(this.translateService.instant('validation.passwordsDoNotMatch'), 'Validation Error');
      return;
    }

    // Check specifically for department ID and make sure it's a valid number
    const departmentId = this.officerForm.get('departmentId')?.value;
    console.log('Department ID before conversion:', departmentId, 'Type:', typeof departmentId);
    
    if (departmentId === null || departmentId === undefined) {
      this.toastr.error('Department selection is required');
      this.officerForm.get('departmentId')?.markAsTouched();
      return;
    }

    // CRITICAL FIX: Force department ID to be a number using parseInt
    const numericDepartmentId = parseInt(departmentId, 10);
    if (isNaN(numericDepartmentId)) {
      this.toastr.error('Invalid department ID format');
      this.officerForm.get('departmentId')?.markAsTouched();
      return;
    }

    // Verify this department actually exists in our data
    const departmentExists = this.departments.some(d => Number(d.id) === numericDepartmentId);
    if (!departmentExists) {
      this.toastr.error(`Department with ID ${numericDepartmentId} not found in available departments`);
      console.error('Available departments:', this.departments.map(d => ({id: d.id, name: d.name})));
      return;
    }

    this.submitting = true;
    
    console.log('DEPARTMENT VERIFICATION:');
    console.log('Form department ID (raw):', departmentId);
    console.log('Form department ID (numeric):', numericDepartmentId);
    console.log('Department exists in list:', departmentExists);
    console.log('All departments:', this.departments);
    console.log('Matching department:', this.departments.find(d => Number(d.id) === numericDepartmentId));
    
    // Create a copy of the form value and remove confirmPassword
    const officerData = { ...this.officerForm.value };
    delete officerData.confirmPassword;

    console.log('Sending officer data:', JSON.stringify(officerData));
    console.log('Department ID in payload:', officerData.departmentId, 'Type:', typeof officerData.departmentId);

    // For debugging - manually check backend directly with EXACT formatting
    console.log(`If you want to test this directly in curl:`);
    console.log(`curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '${JSON.stringify(officerData)}' http://localhost:8080/api/v1/admin/officers`);

    // CRITICAL FIX: Use proper Content-Type to ensure correct JSON parsing
    const request = this.isEditMode
      ? this.http.put(`${environment.apiUrl}/admin/officers/${this.officerId}`, officerData, {
          headers: { 'Content-Type': 'application/json' }
        })
      : this.http.post(`${environment.apiUrl}/admin/officers`, officerData, {
          headers: { 'Content-Type': 'application/json' }
        });

    request.subscribe({
      next: (response) => {
        console.log('Server response:', response);
        this.toastr.success(`Officer ${this.isEditMode ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/admin/officers']);
      },
      error: (error) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} officer:`, error);
        console.error('Error details:', error.error);
        this.submitting = false;
        
        // Enhanced error handler with more specific messages
        if (error.error?.message?.includes('Email is already in use')) {
          this.toastr.error('Email address is already in use');
        } else if (error.error?.message?.includes('Badge number is already in use')) {
          this.toastr.error('Badge number is already in use');
        } else if (error.error?.message?.includes('department') || error.error?.message?.includes('Department')) {
          // Handle department-related errors more specifically
          this.toastr.error('Department error: Please ensure that you selected a valid department.');
          console.error('Department error details:', {
            departmentId: officerData.departmentId,
            departmentExists: this.departments.some(d => Number(d.id) === officerData.departmentId),
            availableDepartments: this.departments
          });
          
          // Try to retry with a stringified department ID as a workaround
          if (typeof officerData.departmentId === 'number') {
            console.log('Attempting workaround by explicitly converting department ID to number...');
            // No need to retry - this would be a development-only technique
            // Just show more diagnostic information
            console.log('Department diagnostic information:');
            console.log('Current officerData.departmentId:', officerData.departmentId);
            this.departments.forEach(dept => {
              console.log(`Department ${dept.name}: id=${dept.id}, type=${typeof dept.id}`);
            });
          }
        } else if (error.error?.message?.includes('null value in column')) {
          // This is likely a database constraint violation
          console.error('Database constraint violation:', error.error.message);
          
          // Provide more specific error message
          this.toastr.error('Required field is missing. Please check your form and try again.');
          
          // Log full payload for debugging
          console.error('Full payload sent:', officerData);
          
          // Attempts to extract the problematic column name
          const columnMatch = error.error.message.match(/null value in column "([^"]+)"/);
          if (columnMatch && columnMatch[1]) {
            const fieldName = columnMatch[1];
            this.toastr.error(`Missing required field: ${fieldName}`);
            // Mark the field as touched and in error if it exists in the form
            const field = this.officerForm.get(fieldName);
            if (field) {
              field.markAsTouched();
              field.setErrors({ required: true });
            }
          }
        } else {
          this.toastr.error(error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} officer`);
        }
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}