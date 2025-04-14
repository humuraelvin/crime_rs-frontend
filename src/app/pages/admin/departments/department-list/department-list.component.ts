import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { AdminService } from '../../../../services/admin.service';
import { Department } from '../../../../core/models/department.model';
import { NotificationService } from '../../../../services/notification.service';
import { ConfirmDialogService } from '../../../../services/confirm-dialog.service';
import { HttpErrorResponse } from '@angular/common/http';

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
      
      <div *ngIf="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p class="font-bold">Backend Error</p>
        <p class="whitespace-pre-line">{{ errorMessage }}</p>
        
        <div *ngIf="showError && errorMessage.includes('lazy')" class="mt-3 bg-yellow-100 p-3 rounded">
          <p class="font-bold">Fix Instructions:</p>
          <ol class="list-decimal pl-5 space-y-2">
            <li>Check your <code>AdminServiceImpl.java</code> file</li>
            <li>Both <code>getAllDepartments()</code> and <code>getAllDepartmentsPaged()</code> methods should use the repository's <code>findAllWithOfficers()</code> method</li>
            <li>Ensure both methods have the <code>@Transactional</code> annotation</li>
            <li>Restart your backend service after making these changes</li>
          </ol>
          <div class="mt-3">
            <button (click)="retryConnection()" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
              Test Connection Again
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="!loading && !errorMessage && departments.length > 0" class="overflow-x-auto">
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
                <button (click)="deleteDepartment(dept)" class="text-red-600 hover:text-red-800">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="!loading && departments.length === 0 && !errorMessage" class="text-center p-4 bg-gray-50 rounded">
        No departments found.
      </div>
    </div>
  `,
  styles: []
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';
  showError = false;
  showFixInstructions = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.showError = false;
    
    this.adminService.getAllDepartmentsPaged(0, 100).subscribe({
      next: (response) => {
        this.departments = response.content;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.showError = true;
        
        console.error('Error loading departments:', error);
        
        if (error.error?.message && error.error.message.includes('failed to lazily initialize a collection')) {
          this.errorMessage = `Backend Error: Hibernate lazy loading issue in Department entity.
          
This error occurs because the Department.officers collection could not be initialized.

To fix this issue:

1. Open AdminServiceImpl.java
2. Locate the getAllDepartments() method 
3. Make sure it has the @Transactional annotation
4. Ensure you're using the findAllWithOfficers() method from the repository

Sample implementation:
@Override
@Transactional
public List<DepartmentResponse> getAllDepartments() {
    List<Department> departments = departmentRepository.findAllWithOfficers();
    return departments.stream()
        .map(this::mapToDepartmentResponse)
        .collect(Collectors.toList());
}`;
        } else {
          this.errorMessage = `Error loading departments: ${error.message}`;
        }
      }
    });
  }

  deleteDepartment(department: Department): void {
    this.confirmDialogService.openConfirmDialog(
      'Delete Department',
      `Are you sure you want to delete department "${department.name}"?`
    ).subscribe((confirmed: boolean) => {
      if (confirmed) {
        if ((department.officerCount || 0) > 0) {
          this.notificationService.showError(
            `Cannot delete department "${department.name}" because it has ${department.officerCount || 0} assigned officers.`
          );
          return;
        }
        
        this.adminService.deleteDepartment(department.id).subscribe({
          next: () => {
            this.notificationService.showSuccess(`Department "${department.name}" deleted successfully.`);
            this.loadDepartments();
          },
          error: (error: any) => {
            console.error('Error deleting department:', error);
            let errorMsg = 'An error occurred while deleting the department.';
            
            if (error.error?.message) {
              errorMsg = error.error.message;
            }
            
            this.notificationService.showError(errorMsg);
          }
        });
      }
    });
  }
  
  createDepartment(): void {
    this.router.navigate(['/admin/departments/create']);
  }
  
  editDepartment(departmentId: number): void {
    this.router.navigate(['/admin/departments/edit', departmentId]);
  }
  
  retryConnection(): void {
    this.loadDepartments();
  }
}