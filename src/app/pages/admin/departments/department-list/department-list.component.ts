import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Departments</h1>
        <a routerLink="/admin/departments/create" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
          <span class="material-icons mr-1">add</span>
          Add Department
        </a>
      </div>

      <div *ngIf="loading" class="flex justify-center my-8">
        <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
      </div>

      <div *ngIf="!loading">
        <div *ngIf="departments.length === 0" class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-gray-600">No departments found. Click the "Add Department" button to create one.</p>
        </div>

        <div *ngIf="departments.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="py-3 px-4 text-left font-medium">ID</th>
                <th class="py-3 px-4 text-left font-medium">Name</th>
                <th class="py-3 px-4 text-left font-medium">Location</th>
                <th class="py-3 px-4 text-left font-medium">Contact</th>
                <th class="py-3 px-4 text-left font-medium">Officers</th>
                <th class="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let department of departments" class="hover:bg-gray-50">
                <td class="py-3 px-4">{{ department.id }}</td>
                <td class="py-3 px-4 font-medium">{{ department.name }}</td>
                <td class="py-3 px-4">{{ department.location || '-' }}</td>
                <td class="py-3 px-4">{{ department.contactInfo || '-' }}</td>
                <td class="py-3 px-4">{{ department.officerCount }}</td>
                <td class="py-3 px-4 text-right space-x-2">
                  <a [routerLink]="['/admin/departments/edit', department.id]" class="text-blue-600 hover:text-blue-800">
                    <span class="material-icons">edit</span>
                  </a>
                  <button (click)="deleteDepartment(department)" class="text-red-600 hover:text-red-800" 
                         [disabled]="department.officerCount > 0">
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DepartmentListComponent implements OnInit {
  loading = true;
  departments: Department[] = [];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.http.get<Department[]>(`${environment.apiUrl}/admin/departments`)
      .subscribe({
        next: (data) => {
          this.departments = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.toastr.error('Failed to load departments');
          this.loading = false;
        }
      });
  }

  deleteDepartment(department: Department): void {
    if (department.officerCount > 0) {
      this.toastr.error('Cannot delete department with assigned officers');
      return;
    }

    if (confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      this.http.delete(`${environment.apiUrl}/admin/departments/${department.id}`)
        .subscribe({
          next: () => {
            this.toastr.success('Department deleted successfully');
            this.loadDepartments();
          },
          error: (error) => {
            console.error('Error deleting department:', error);
            this.toastr.error('Failed to delete department');
          }
        });
    }
  }
} 