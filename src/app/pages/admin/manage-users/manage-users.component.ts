import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

interface UserRole {
  value: string;
  label: string;
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
              <button (click)="showCreateUserForm()"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Add New User
              </button>
            </div>
          </div>

          <!-- User Form (Create/Edit) -->
          <div *ngIf="showForm" class="bg-white rounded-xl shadow-md p-8 mb-6">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-xl font-semibold text-gray-900">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h3>
              <button (click)="cancelForm()" class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 rounded-full p-1 transition duration-200">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-2">First Name <span class="text-red-600">*</span></label>
                  <input type="text" id="firstName" formControlName="firstName"
                         class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  <div *ngIf="userForm.get('firstName')?.touched && userForm.get('firstName')?.errors?.['required']"
                       class="mt-2 text-sm text-red-600">
                    First name is required
                  </div>
                </div>

                <div>
                  <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-2">Last Name <span class="text-red-600">*</span></label>
                  <input type="text" id="lastName" formControlName="lastName"
                         class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  <div *ngIf="userForm.get('lastName')?.touched && userForm.get('lastName')?.errors?.['required']"
                       class="mt-2 text-sm text-red-600">
                    Last name is required
                  </div>
                </div>

                <div>
                  <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email <span class="text-red-600">*</span></label>
                  <input type="email" id="email" formControlName="email"
                         class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  <div *ngIf="userForm.get('email')?.touched && userForm.get('email')?.errors?.['required']"
                       class="mt-2 text-sm text-red-600">
                    Email is required
                  </div>
                  <div *ngIf="userForm.get('email')?.touched && userForm.get('email')?.errors?.['email']"
                       class="mt-2 text-sm text-red-600">
                    Please enter a valid email
                  </div>
                </div>

                <div>
                  <label for="phoneNumber" class="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span class="text-red-600">*</span></label>
                  <input type="tel" id="phoneNumber" formControlName="phoneNumber"
                         class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  <div *ngIf="userForm.get('phoneNumber')?.touched && userForm.get('phoneNumber')?.errors?.['required']"
                       class="mt-2 text-sm text-red-600">
                    Phone number is required
                  </div>
                  <div *ngIf="userForm.get('phoneNumber')?.touched && userForm.get('phoneNumber')?.errors?.['pattern']"
                       class="mt-2 text-sm text-red-600">
                    Please enter a valid phone number
                  </div>
                </div>

                <div>
                  <label for="role" class="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select id="role" formControlName="role"
                          class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                    <option *ngFor="let role of userRoles" [value]="role.value">
                      {{ role.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="status" class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select id="status" formControlName="status"
                          class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div *ngIf="!isEditMode" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password <span class="text-red-600">*</span></label>
                  <input type="password" id="password" formControlName="password"
                         class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  <div *ngIf="userForm.get('password')?.touched && userForm.get('password')?.errors?.['required']"
                       class="mt-2 text-sm text-red-600">
                    Password is required
                  </div>
                  <div *ngIf="userForm.get('password')?.touched && userForm.get('password')?.errors?.['minlength']"
                       class="mt-2 text-sm text-red-600">
                    Password must be at least 8 characters
                  </div>
                </div>

                <div>
                  <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password <span class="text-red-600">*</span></label>
                  <input type="password" id="confirmPassword" formControlName="confirmPassword"
                         class="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  <div *ngIf="userForm.get('confirmPassword')?.touched && userForm.get('confirmPassword')?.errors?.['required']"
                       class="mt-2 text-sm text-red-600">
                    Please confirm password
                  </div>
                  <div *ngIf="userForm.get('confirmPassword')?.touched && userForm.errors?.['passwordMismatch']"
                       class="mt-2 text-sm text-red-600">
                    Passwords do not match
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-4 pt-4">
                <button type="button" (click)="cancelForm()"
                        class="px-4 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  Cancel
                </button>
                <button type="submit"
                        [disabled]="userForm.invalid || isSubmitting"
                        class="px-4 py-3 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200">
                  {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User') }}
                </button>
              </div>
            </form>
          </div>

          <!-- Users List -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let user of users">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [ngClass]="{
                              'bg-blue-100 text-blue-800': user.role === 'ADMIN',
                              'bg-green-100 text-green-800': user.role === 'POLICE_OFFICER',
                              'bg-gray-100 text-gray-800': user.role === 'CITIZEN'
                            }">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [ngClass]="{
                              'bg-green-100 text-green-800': user.status === 'ACTIVE',
                              'bg-gray-100 text-gray-800': user.status === 'INACTIVE',
                              'bg-red-100 text-red-800': user.status === 'SUSPENDED'
                            }">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button (click)="confirmDeleteUser(user)"
                              class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
    .max-w-6xl {
      max-width: 80rem;
    }

    /* Enhance form controls */
    input, select {
      font-size: 0.875rem;
      line-height: 1.5;
      border-width: 1px;
    }

    /* Button disabled state */
    button:disabled {
      opacity: 0.7;
    }

    /* Add subtle shadow to form container */
    .shadow-md {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Improve SVG hover effect */
    button svg {
      transition: stroke 0.2s ease;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .max-w-6xl {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      .md\\:grid-cols-2 {
        grid-template-columns: 1fr;
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
export class ManageUsersComponent implements OnInit {
  userForm!: FormGroup;
  users: any[] = [];
  showForm = false;
  isEditMode = false;
  isSubmitting = false;
  selectedUserId: number | null = null;

  userRoles: UserRole[] = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'POLICE_OFFICER', label: 'Police Officer' },
    { value: 'CITIZEN', label: 'Citizen' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.toastr.error('Unauthorized access');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadUsers();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+]{10,}$')]],
      role: ['CITIZEN', Validators.required],
      status: ['ACTIVE', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        this.toastr.error('Failed to load users');
      }
    });
  }

  showCreateUserForm(): void {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.initForm();
    this.showForm = true;
  }

  editUser(user: any): void {
    this.isEditMode = true;
    this.selectedUserId = user.id;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status
    });

    // Remove password validators for edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    this.showForm = true;
  }

  confirmDeleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.toastr.success('User deleted successfully');
          this.loadUsers();
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to delete user');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      const userData = this.userForm.value;

      const request = this.isEditMode ?
        this.userService.updateUser(Number(this.selectedUserId), userData) :
        this.userService.createUser(userData);

      request.subscribe({
        next: () => {
          this.toastr.success(`User ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.cancelForm();
          this.loadUsers();
        },
        error: (error) => {
          this.toastr.error(error.message || `Failed to ${this.isEditMode ? 'update' : 'create'} user`);
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.toastr.error('Please fill in all required fields correctly');
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.selectedUserId = null;
    this.userForm.reset({
      role: 'CITIZEN',
      status: 'ACTIVE'
    });
  }

  getRoleLabel(role: string): string {
    const roleObj = this.userRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }
}
