import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComplaintService, ComplaintResponse } from '../../../core/services/complaint.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SortableDirective, SortEvent } from '../../../shared/directives/sortable.directive';
import { FormsModule } from '@angular/forms';

// Define an interface for the paginated response
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Define the raw data interface with basic fields
interface RawComplaintData {
  id: number;
  userId?: number;
  userName?: string;
  description?: string;
  location?: string;
  status?: string;
  crimeType?: string;
  category?: string;
  type?: string;
  title?: string;
  
  // Common date fields
  dateFiled?: string;
  createdAt?: string;
  date?: string;
  incidentDate?: string;
  
  // Update date fields
  dateLastUpdated?: string;
  updatedAt?: string;

  // Other fields
  priorityScore?: number;
  evidences?: any[];
  comments?: any[];
  
  // Allow dynamic keys for flexibility
  [key: string]: any;
}

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, PaginationComponent, SortableDirective, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ 'complaint.my_complaints' | translate }}</h1>
          <button
            *ngIf="isCitizen"
            routerLink="/complaints/create"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center text-sm sm:text-base"
          >
            <span class="material-icons mr-2">add</span>
            {{ 'complaint.create' | translate }}
          </button>
        </div>

        <!-- Search and Filter Controls -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'complaint.type' | translate }}</label>
              <select
                [(ngModel)]="typeFilter"
                (change)="applyFilters()"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{{ 'search.allTypes' | translate }}</option>
                <option value="THEFT">{{ 'crimeTypes.theft' | translate }}</option>
                <option value="ASSAULT">{{ 'crimeTypes.assault' | translate }}</option>
                <option value="BURGLARY">{{ 'crimeTypes.burglary' | translate }}</option>
                <option value="FRAUD">{{ 'crimeTypes.fraud' | translate }}</option>
                <option value="VANDALISM">{{ 'crimeTypes.vandalism' | translate }}</option>
                <option value="HARASSMENT">{{ 'crimeTypes.harassment' | translate }}</option>
                <option value="DRUG_RELATED">{{ 'crimeTypes.drugRelated' | translate }}</option>
                <option value="OTHER">{{ 'crimeTypes.other' | translate }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'complaint.status' | translate }}</label>
              <select
                [(ngModel)]="statusFilter"
                (change)="applyFilters()"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{{ 'search.allStatuses' | translate }}</option>
                <option value="SUBMITTED">{{ 'status.submitted' | translate }}</option>
                <option value="UNDER_REVIEW">{{ 'status.under_review' | translate }}</option>
                <option value="ASSIGNED">{{ 'status.assigned' | translate }}</option>
                <option value="INVESTIGATING">{{ 'status.investigating' | translate }}</option>
                <option value="RESOLVED">{{ 'status.resolved' | translate }}</option>
                <option value="REJECTED">{{ 'status.rejected' | translate }}</option>
                <option value="CLOSED">{{ 'status.closed' | translate }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'search' | translate }}</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
                placeholder="{{ 'search.searchPlaceholder' | translate }}"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Complaints List -->
        <div class="bg-white shadow-md rounded-lg overflow-x-auto">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th 
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6"
                [appSortable]="'id'"
                [direction]="sortColumn === 'id' ? sortDirection : ''"
                (sort)="onSort($event)"
              >{{ 'complaint.id' | translate }}</th>
              <th 
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6"
                [appSortable]="'description'"
                [direction]="sortColumn === 'description' ? sortDirection : ''"
                (sort)="onSort($event)"
              >{{ 'complaint.description' | translate }}</th>
              <th 
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 hidden sm:table-cell"
                [appSortable]="'category'"
                [direction]="sortColumn === 'category' ? sortDirection : ''"
                (sort)="onSort($event)"
              >{{ 'complaint.type' | translate }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 hidden md:table-cell">{{ 'complaint.location' | translate }}</th>
              <th 
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6"
                [appSortable]="'status'"
                [direction]="sortColumn === 'status' ? sortDirection : ''"
                (sort)="onSort($event)"
              >{{ 'complaint.status' | translate }}</th>
              <th 
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 hidden lg:table-cell"
                [appSortable]="'dateFiled'"
                [direction]="sortColumn === 'dateFiled' ? sortDirection : ''"
                (sort)="onSort($event)"
              >{{ 'complaint.date_filed' | translate }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">{{ 'actions.title' | translate }}</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngIf="loading" class="text-center">
              <td colspan="7" class="px-4 py-4 sm:px-6">
                <div class="flex justify-center items-center">
                  <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="ml-2">{{ 'messages.loading' | translate }}</span>
                </div>
              </td>
            </tr>
            <tr *ngIf="!loading && filteredComplaints.length === 0" class="text-center">
              <td colspan="7" class="px-4 py-4 sm:px-6">
                <p class="text-gray-500">{{ 'messages.noComplaints' | translate }}</p>
                <button *ngIf="isCitizen"
                        routerLink="/complaints/create"
                        class="mt-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base">
                  {{ 'messages.createFirst' | translate }}
                </button>
              </td>
            </tr>
            <tr *ngFor="let complaint of pagedComplaints" class="hover:bg-gray-50">
              <td class="px-4 py-4 text-sm text-gray-500 sm:px-6">#{{complaint.id}}</td>
              <td class="px-4 py-4 text-sm text-gray-900 sm:px-6">{{complaint.description}}</td>
              <td class="px-4 py-4 text-sm text-gray-900 sm:px-6 hidden sm:table-cell">{{complaint.category || 'N/A'}}</td>
              <td class="px-4 py-4 text-sm text-gray-900 sm:px-6 hidden md:table-cell">{{complaint.location || 'N/A'}}</td>
              <td class="px-4 py-4 sm:px-6">
              <span [ngClass]="{
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                'bg-yellow-100 text-yellow-800': complaint.status === 'SUBMITTED',
                'bg-blue-100 text-blue-800': complaint.status === 'UNDER_REVIEW',
                'bg-green-100 text-green-800': complaint.status === 'RESOLVED',
                'bg-red-100 text-red-800': complaint.status === 'REJECTED'
              }">
                {{complaint.status}}
              </span>
              </td>
              <td class="px-4 py-4 text-sm text-gray-500 sm:px-6 hidden lg:table-cell">
                <div class="flex flex-col">
                  <span>{{ 'complaint.date_filed' | translate }}: {{formatDate(complaint.dateFiled)}}</span>
                  <span class="text-xs">{{ 'complaint.date_updated' | translate }}: {{formatDate(complaint.dateLastUpdated)}}</span>
                </div>
              </td>
              <td class="px-4 py-4 text-sm font-medium sm:px-6">
                <a [routerLink]="['/complaints', complaint.id]" class="text-blue-600 hover:text-blue-900">{{ 'actions.view' | translate }}</a>
                <a *ngIf="isCitizen && complaint.status === 'SUBMITTED'" 
                   [routerLink]="['/complaints', complaint.id, 'edit']" 
                   class="ml-3 text-green-600 hover:text-green-900">
                   {{ 'actions.edit' | translate }}
                </a>
              </td>
            </tr>
            </tbody>
          </table>
          
          <!-- Pagination -->
          <app-pagination
            *ngIf="filteredComplaints.length > 0"
            [totalItems]="filteredComplaints.length"
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
export class ComplaintsListComponent implements OnInit {
  complaints: ComplaintResponse[] = [];
  filteredComplaints: ComplaintResponse[] = [];
  pagedComplaints: ComplaintResponse[] = [];
  loading = true;
  isCitizen = false;
  isAdmin = false;
  isPoliceOfficer = false;
  
  // Search and filter properties
  searchQuery: string = '';
  typeFilter: string = '';
  statusFilter: string = '';
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  
  // Sorting
  sortColumn: string = 'dateFiled';
  sortDirection: 'asc' | 'desc' | '' = 'desc';

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.isCitizen = this.authService.hasRole(UserRole.CITIZEN);
    this.isAdmin = this.authService.hasRole(UserRole.ADMIN);
    this.isPoliceOfficer = this.authService.hasRole(UserRole.POLICE_OFFICER);
  }

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading = true;

    // Use different endpoints based on user role
    let observable = this.complaintService.getComplaints();

    if (this.isCitizen) {
      console.log('Loading complaints for citizen');
      observable = this.complaintService.getMyComplaints();
    } else if (this.isAdmin || this.isPoliceOfficer) {
      console.log('Loading all complaints for admin/police');
      observable = this.complaintService.getComplaints();
    }

    observable.subscribe({
      next: (data: any) => {
        console.log('Raw complaint data:', data);

        // Check if the response is paginated
        if (data && data.content && Array.isArray(data.content)) {
          this.complaints = data.content.map((complaint: any) => this.mapComplaintData(complaint));
        } else if (Array.isArray(data)) {
          // If response is already an array
          this.complaints = data.map((complaint: any) => this.mapComplaintData(complaint));
        } else {
          console.error('Unexpected data format:', data);
          this.complaints = [];
          this.toastr.error('Invalid data format received from server');
        }
        
        // Apply filters and sort the data
        this.applyFilters();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading complaints:', error);
        this.toastr.error('Failed to load complaints');
        this.loading = false;
        this.complaints = [];
      }
    });
  }

  // Helper method to map complaint data - simplified version but still handling dates correctly
  private mapComplaintData(rawComplaint: RawComplaintData): ComplaintResponse {
    if (!rawComplaint) return {} as ComplaintResponse;

    // Extract type field
    const typeValue = this.extractTypeField(rawComplaint);
    
    // Extract date fields - simplified but keeping the fix
    let dateFiled = rawComplaint.dateFiled || rawComplaint.createdAt || rawComplaint.date || rawComplaint.incidentDate || new Date().toISOString();
    let dateLastUpdated = rawComplaint.dateLastUpdated || rawComplaint.updatedAt || dateFiled;
    
    // Build complaint response
    const complaint: ComplaintResponse = {
      id: rawComplaint.id || 0,
      userId: rawComplaint.userId || 0,
      userName: rawComplaint.userName || 'Unknown',
      crimeType: typeValue,
      category: rawComplaint.category || rawComplaint.crimeType || 'N/A',
      description: rawComplaint.description || '',
      status: rawComplaint.status || 'PENDING',
      dateFiled: dateFiled,
      dateLastUpdated: dateLastUpdated,
      location: rawComplaint.location || 'N/A',
      priorityScore: rawComplaint.priorityScore || 0,
      evidences: rawComplaint.evidences || [],
      comments: rawComplaint.comments || []
    };

    return complaint;
  }

  // Helper to extract type value - simplified
  private extractTypeField(complaint: any): string {
    if (!complaint) return 'N/A';
    
    // Try common field names for the type
    return complaint.crimeType || 
           complaint.type || 
           complaint.category || 
           complaint.title || 
           'N/A';
  }

  // Apply filters method
  applyFilters(): void {
    this.filteredComplaints = this.complaints.filter(complaint => {
      const matchesType = !this.typeFilter || complaint.crimeType === this.typeFilter || complaint.category === this.typeFilter;
      const matchesStatus = !this.statusFilter || complaint.status === this.statusFilter;
      const matchesSearch = !this.searchQuery || 
        (complaint.description && complaint.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (complaint.location && complaint.location.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (complaint.id.toString().includes(this.searchQuery));
      
      return matchesType && matchesStatus && matchesSearch;
    });
    
    // Sort the filtered data
    this.sortData();
    
    // Reset to first page when filters change
    this.currentPage = 0;
    this.updatePage();
  }

  // Simplified formatDate method that still handles different formats
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    
    try {
      // Parse the date string
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // If parsing failed, return the original string
      return String(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return String(date);
    }
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePage();
  }
  
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0; // Reset to first page when changing page size
    this.updatePage();
  }
  
  updatePage(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedComplaints = this.filteredComplaints.slice(start, end);
  }
  
  // Sorting methods
  onSort(event: SortEvent): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.sortData();
    this.updatePage();
  }
  
  sortData(): void {
    if (this.sortColumn === '' || this.sortDirection === '') {
      return;
    }
    
    this.filteredComplaints.sort((a, b) => {
      const valueA = this.getSortValue(a, this.sortColumn);
      const valueB = this.getSortValue(b, this.sortColumn);
      
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      
      if (valueA < valueB) {
        return -1 * direction;
      } else if (valueA > valueB) {
        return 1 * direction;
      }
      return 0;
    });
  }
  
  getSortValue(complaint: ComplaintResponse, column: string): any {
    switch (column) {
      case 'id':
        return complaint.id;
      case 'description':
        return complaint.description.toLowerCase();
      case 'category':
        return (complaint.category || '').toLowerCase();
      case 'status':
        return complaint.status;
      case 'dateFiled':
        return new Date(complaint.dateFiled);
      default:
        return complaint[column as keyof ComplaintResponse];
    }
  }
}
