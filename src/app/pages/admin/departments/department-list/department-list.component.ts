import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';

interface Department {
  id: number;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  officerCount?: number;
}

interface PagedResponse {
  content: Department[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Departments</h1>
        <a routerLink="/admin/departments/new" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Add Department
        </a>
      </div>
      
      <div *ngIf="loading" class="text-center my-4">Loading departments...</div>
      
      <div *ngIf="backendError" class="bg-red-100 p-4 mb-4 rounded">
        <h3 class="text-lg font-bold text-red-700">Backend Error</h3>
        <p class="text-red-700">{{ errorMessage }}</p>
        
        <div class="mt-4">
          <h4 class="font-bold">How to fix this issue:</h4>
          <div *ngIf="errorMessage.includes('Authentication error')">
            <p>Your authentication token may have expired. Please try:</p>
            <ol class="list-decimal ml-6 mt-2">
              <li>Logging out and logging back in</li>
              <li>Clearing browser cache and cookies</li>
              <li>Checking if the backend server is running</li>
            </ol>
          </div>
          
          <div *ngIf="errorMessage.includes('Hibernate lazy loading error')">
            <p>The backend needs to be updated to handle lazy loading of collections:</p>
            <ol class="list-decimal ml-6 mt-2">
              <li>Add {{ '@' }}Transactional to the getAllDepartments() method in AdminServiceImpl.java</li>
              <li>Use JOIN FETCH in JPQL queries to load related collections</li>
              <li>Consider changing collection fetch type from LAZY to EAGER for small collections</li>
            </ol>
          </div>
          
          <button 
            (click)="testConnection()" 
            class="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
            Test Connection Again
          </button>
        </div>
      </div>
      
      <div *ngIf="!loading && !backendError && departments.length > 0" class="overflow-x-auto">
        <table class="min-w-full bg-white border">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b font-medium text-left">Name</th>
              <th class="py-2 px-4 border-b font-medium text-left">Location</th>
              <th class="py-2 px-4 border-b font-medium text-left">Contact Info</th>
              <th class="py-2 px-4 border-b font-medium text-left">Officers</th>
              <th class="py-2 px-4 border-b font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let dept of departments">
              <td class="py-2 px-4 border-b">{{ dept.name }}</td>
              <td class="py-2 px-4 border-b">{{ dept.location }}</td>
              <td class="py-2 px-4 border-b">{{ dept.contactInfo }}</td>
              <td class="py-2 px-4 border-b">{{ dept.officerCount || 0 }}</td>
              <td class="py-2 px-4 border-b text-right">
                <a [routerLink]="['/admin/departments/edit', dept.id]" class="text-blue-600 mr-2">Edit</a>
                <button (click)="deleteDepartment(dept.id)" class="text-red-600 hover:text-red-800">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="!loading && departments.length === 0 && !backendError" class="text-center p-4 bg-gray-50 rounded">
        No departments found.
      </div>
    </div>
  `,
  styles: []
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = true;
  backendError = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.backendError = false;
    
    // Using the paged endpoint with a large size to get all departments
    this.http.get<PagedResponse>(`${environment.apiUrl}/admin/departments/paged?size=100`)
      .subscribe({
        next: (response) => {
          this.departments = response.content;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.backendError = true;
          
          if (error.status === 403) {
            this.errorMessage = 'Authentication error: Your session may have expired. Please log out and log back in.';
          } else if (error.status === 500 && error.error?.message?.includes('failed to lazily initialize a collection')) {
            this.errorMessage = 'Hibernate lazy loading error: The Department.officers collection could not be initialized.';
          } else {
            this.errorMessage = error.error?.message || error.message || 'Failed to load departments';
          }
          
          console.error('Error loading departments:', error);
        }
      });
  }

  deleteDepartment(id: number): void {
    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/admin/departments/${id}`)
      .subscribe({
        next: () => {
          this.toastr.success('Department deleted successfully');
          this.departments = this.departments.filter(dept => dept.id !== id);
        },
        error: (error) => {
          if (error.status === 403) {
            this.toastr.error('Your session may have expired. Please log out and log back in.');
          } else if (error.status === 409 || (error.error?.message && error.error.message.includes('officers'))) {
            this.toastr.error('Cannot delete a department with assigned officers. Reassign officers first.');
          } else {
            this.toastr.error(error.error?.message || 'Failed to delete department');
          }
        }
      });
  }

  testConnection(): void {
    this.loadDepartments();
  }
} 