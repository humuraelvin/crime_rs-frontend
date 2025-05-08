import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, PaginationComponent, FormsModule, TranslateModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Police Officers</h1>
        <a routerLink="/admin/officers/create" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center">
          <span class="material-icons mr-1">add</span>
          Add Officer
        </a>
      </div>

      <!-- Search and Filter Controls -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'search.filterByDepartment' | translate }}</label>
            <select
              (change)="applyFilters()"
              [(ngModel)]="departmentFilter"
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">{{ 'search.allDepartments' | translate }}</option>
              <option *ngFor="let dept of uniqueDepartments" [value]="dept">{{dept}}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'search.filterByRank' | translate }}</label>
            <select
              (change)="applyFilters()"
              [(ngModel)]="rankFilter"
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">{{ 'search.allRanks' | translate }}</option>
              <option *ngFor="let rank of uniqueRanks" [value]="rank">{{rank}}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'search' | translate }}</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
              placeholder="{{ 'search.searchOfficers' | translate }}"
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center my-8">
        <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
      </div>

      <div *ngIf="!loading">
        <div *ngIf="filteredOfficers.length === 0" class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-gray-600">No police officers found matching your criteria.</p>
        </div>

        <div *ngIf="filteredOfficers.length > 0" class="overflow-x-auto">
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
              <tr *ngFor="let officer of displayedOfficers" class="hover:bg-gray-50">
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
          
          <!-- Add Pagination -->
          <app-pagination
            *ngIf="filteredOfficers.length > 0"
            [totalItems]="filteredOfficers.length"
            [currentPage]="currentPage"
            [pageSize]="pageSize"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)"
          ></app-pagination>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OfficerListComponent implements OnInit {
  loading = true;
  officers: PoliceOfficer[] = [];
  filteredOfficers: PoliceOfficer[] = [];
  displayedOfficers: PoliceOfficer[] = [];
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  
  // Filters
  departmentFilter: string = '';
  rankFilter: string = '';
  searchQuery: string = '';
  
  // Unique filter options
  uniqueDepartments: string[] = [];
  uniqueRanks: string[] = [];

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
          this.extractFilterOptions();
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading officers:', error);
          this.toastr.error('Failed to load officers');
          this.loading = false;
        }
      });
  }
  
  extractFilterOptions(): void {
    // Extract unique departments
    this.uniqueDepartments = [...new Set(this.officers.map(officer => officer.departmentName))].filter(Boolean);
    
    // Extract unique ranks
    this.uniqueRanks = [...new Set(this.officers.map(officer => officer.rank))].filter(Boolean);
  }
  
  applyFilters(): void {
    this.filteredOfficers = this.officers.filter(officer => {
      const matchesDepartment = !this.departmentFilter || officer.departmentName === this.departmentFilter;
      const matchesRank = !this.rankFilter || officer.rank === this.rankFilter;
      const matchesSearch = !this.searchQuery || 
        (officer.firstName && officer.firstName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (officer.lastName && officer.lastName.toLowerCase().includes(this.searchQuery.toLowerCase())) || 
        (officer.badgeNumber && officer.badgeNumber.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (`${officer.firstName} ${officer.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      return matchesDepartment && matchesRank && matchesSearch;
    });
    
    this.currentPage = 0; // Reset to first page when filters change
    this.updateDisplayedOfficers();
  }
  
  // Update displayed officers based on pagination
  updateDisplayedOfficers(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOfficers = this.filteredOfficers.slice(start, end);
  }
  
  // Handle page change event
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayedOfficers();
  }
  
  // Handle page size change event
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 0; // Reset to first page when changing page size
    this.updateDisplayedOfficers();
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