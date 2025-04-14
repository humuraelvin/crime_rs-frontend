import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

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
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-officer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Police Officers</h1>
        <a routerLink="/admin/officers/create" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
          <span class="material-icons mr-1">add</span>
          Add Officer
        </a>
      </div>

      <div *ngIf="loading" class="flex justify-center my-8">
        <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
      </div>

      <div *ngIf="!loading">
        <div *ngIf="officers.length === 0" class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-gray-600">No police officers found. Click the "Add Officer" button to create one.</p>
        </div>

        <div *ngIf="officers.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="py-3 px-4 text-left font-medium">ID</th>
                <th class="py-3 px-4 text-left font-medium">Name</th>
                <th class="py-3 px-4 text-left font-medium">Badge Number</th>
                <th class="py-3 px-4 text-left font-medium">Department</th>
                <th class="py-3 px-4 text-left font-medium">Rank</th>
                <th class="py-3 px-4 text-left font-medium">Active Cases</th>
                <th class="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let officer of officers" class="hover:bg-gray-50">
                <td class="py-3 px-4">{{ officer.id }}</td>
                <td class="py-3 px-4 font-medium">{{ officer.firstName }} {{ officer.lastName }}</td>
                <td class="py-3 px-4">{{ officer.badgeNumber }}</td>
                <td class="py-3 px-4">{{ officer.departmentName }}</td>
                <td class="py-3 px-4">{{ officer.rank }}</td>
                <td class="py-3 px-4">{{ officer.activeCasesCount }}</td>
                <td class="py-3 px-4 text-right space-x-2">
                  <a [routerLink]="['/admin/officers/edit', officer.id]" class="text-blue-600 hover:text-blue-800">
                    <span class="material-icons">edit</span>
                  </a>
                  <button (click)="deleteOfficer(officer)" class="text-red-600 hover:text-red-800" 
                         [disabled]="officer.activeCasesCount > 0">
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
export class OfficerListComponent implements OnInit {
  loading = true;
  officers: PoliceOfficer[] = [];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOfficers();
  }

  loadOfficers(): void {
    this.loading = true;
    this.http.get<PoliceOfficer[]>(`${environment.apiUrl}/admin/officers`)
      .subscribe({
        next: (officers) => {
          this.officers = officers;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading officers:', error);
          this.toastr.error('Failed to load officers');
          this.loading = false;
        }
      });
  }

  deleteOfficer(officer: PoliceOfficer): void {
    if (officer.activeCasesCount > 0) {
      this.toastr.error(`Cannot delete officer with ${officer.activeCasesCount} active cases`);
      return;
    }

    if (confirm(`Are you sure you want to delete ${officer.firstName} ${officer.lastName}?`)) {
      this.http.delete(`${environment.apiUrl}/admin/officers/${officer.id}`)
        .subscribe({
          next: () => {
            this.toastr.success('Officer deleted successfully');
            this.loadOfficers();
          },
          error: (error) => {
            console.error('Error deleting officer:', error);
            this.toastr.error('Failed to delete officer');
          }
        });
    }
  }
} 