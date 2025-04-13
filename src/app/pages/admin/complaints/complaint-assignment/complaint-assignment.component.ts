import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface ComplaintStatus {
  id: string;
  label: string;
}

interface Complaint {
  id: number;
  subject: string;
  description: string;
  location: string;
  crimeType: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  dateFiled: string;
  assignedOfficer?: {
    id: number;
    firstName: string;
    lastName: string;
    badgeNumber: string;
    departmentName: string;
  };
}

interface PoliceOfficer {
  id: number;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  departmentId: number;
  departmentName: string;
  activeCasesCount: number;
}

@Component({
  selector: 'app-complaint-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Complaint Assignment</h1>
      </div>

      <div *ngIf="loading" class="flex justify-center my-8">
        <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
      </div>

      <div *ngIf="!loading">
        <div class="mb-6 bg-white rounded-lg shadow-md p-4">
          <h2 class="text-lg font-semibold mb-4">Filters</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                id="statusFilter" 
                [(ngModel)]="filters.status" 
                (change)="loadComplaints()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [value]="null">All Statuses</option>
                <option *ngFor="let status of complaintStatuses" [value]="status.id">{{ status.label }}</option>
              </select>
            </div>
            <div>
              <label for="crimeType" class="block text-sm font-medium text-gray-700 mb-1">Crime Type</label>
              <select 
                id="crimeType" 
                [(ngModel)]="filters.crimeType" 
                (change)="loadComplaints()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [value]="null">All Types</option>
                <option value="ASSAULT">Assault</option>
                <option value="THEFT">Theft</option>
                <option value="ROBBERY">Robbery</option>
                <option value="VANDALISM">Vandalism</option>
                <option value="FRAUD">Fraud</option>
                <option value="CYBERCRIME">Cybercrime</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div class="flex items-end">
              <button 
                (click)="resetFilters()" 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="complaints.length === 0" class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-gray-600">No complaints found with the selected filters.</p>
        </div>

        <div *ngIf="complaints.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
          <table class="min-w-full">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="py-3 px-4 text-left font-medium">ID</th>
                <th class="py-3 px-4 text-left font-medium">Subject</th>
                <th class="py-3 px-4 text-left font-medium">Type</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Date Filed</th>
                <th class="py-3 px-4 text-left font-medium">Reported By</th>
                <th class="py-3 px-4 text-left font-medium">Assigned Officer</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let complaint of complaints" class="hover:bg-gray-50">
                <td class="py-3 px-4">{{ complaint.id }}</td>
                <td class="py-3 px-4 font-medium">{{ complaint.subject }}</td>
                <td class="py-3 px-4">{{ formatEnumValue(complaint.crimeType) }}</td>
                <td class="py-3 px-4">
                  <span [ngClass]="getStatusClass(complaint.status)">
                    {{ formatEnumValue(complaint.status) }}
                  </span>
                </td>
                <td class="py-3 px-4">{{ formatDate(complaint.dateFiled) }}</td>
                <td class="py-3 px-4">{{ complaint.user.firstName }} {{ complaint.user.lastName }}</td>
                <td class="py-3 px-4">
                  <span *ngIf="complaint.assignedOfficer">
                    {{ complaint.assignedOfficer.firstName }} {{ complaint.assignedOfficer.lastName }} 
                    ({{ complaint.assignedOfficer.badgeNumber }})
                  </span>
                  <span *ngIf="!complaint.assignedOfficer" class="text-gray-500">Not assigned</span>
                </td>
                <td class="py-3 px-4">
                  <button 
                    *ngIf="!complaint.assignedOfficer && (complaint.status === 'SUBMITTED' || complaint.status === 'UNDER_REVIEW')"
                    (click)="openAssignmentModal(complaint)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    Assign
                  </button>
                  <button 
                    *ngIf="complaint.assignedOfficer"
                    (click)="openAssignmentModal(complaint)"
                    class="text-yellow-600 hover:text-yellow-800"
                  >
                    Reassign
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <div *ngIf="showAssignmentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">Assign Complaint #{{ selectedComplaint?.id }}</h2>
          <button (click)="closeAssignmentModal()" class="text-gray-500 hover:text-gray-700">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div *ngIf="loadingOfficers" class="flex justify-center my-4">
          <app-loading-spinner [size]="'md'" [color]="'primary'"></app-loading-spinner>
        </div>
        
        <div *ngIf="!loadingOfficers">
          <div *ngIf="officers.length === 0" class="mb-4 text-center">
            <p class="text-gray-600">No officers available for assignment.</p>
          </div>
          
          <div *ngIf="officers.length > 0">
            <div class="mb-4">
              <label for="officerSelect" class="block text-sm font-medium text-gray-700 mb-1">Select Officer</label>
              <select 
                id="officerSelect" 
                [(ngModel)]="selectedOfficerId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [ngValue]="null" disabled>Select an officer</option>
                <option *ngFor="let officer of officers" [ngValue]="officer.id">
                  {{ officer.firstName }} {{ officer.lastName }} ({{ officer.badgeNumber }}) - 
                  {{ officer.departmentName }} - Active Cases: {{ officer.activeCasesCount }}
                </option>
              </select>
            </div>
            
            <div class="flex justify-end">
              <button 
                (click)="closeAssignmentModal()" 
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-4"
              >
                Cancel
              </button>
              <button 
                (click)="assignOfficer()" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                [disabled]="!selectedOfficerId || submitting"
              >
                {{ submitting ? 'Assigning...' : 'Assign Officer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-submitted {
      background-color: #e5e7eb;
      color: #4b5563;
    }
    .status-under-review {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .status-assigned {
      background-color: #fef3c7;
      color: #92400e;
    }
    .status-investigating {
      background-color: #c7d2fe;
      color: #3730a3;
    }
    .status-pending-evidence {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .status-resolved {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status-rejected {
      background-color: #fecaca;
      color: #991b1b;
    }
  `]
})
export class ComplaintAssignmentComponent implements OnInit {
  loading = true;
  loadingOfficers = false;
  submitting = false;
  complaints: Complaint[] = [];
  officers: PoliceOfficer[] = [];
  
  filters = {
    status: null as string | null,
    crimeType: null as string | null
  };
  
  complaintStatuses: ComplaintStatus[] = [
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'UNDER_REVIEW', label: 'Under Review' },
    { id: 'ASSIGNED', label: 'Assigned' },
    { id: 'INVESTIGATING', label: 'Investigating' },
    { id: 'PENDING_EVIDENCE', label: 'Pending Evidence' },
    { id: 'RESOLVED', label: 'Resolved' },
    { id: 'REJECTED', label: 'Rejected' }
  ];
  
  showAssignmentModal = false;
  selectedComplaint: Complaint | null = null;
  selectedOfficerId: number | null = null;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading = true;
    
    let url = `${environment.apiUrl}/complaints`;
    const params: { [key: string]: string } = {};
    
    if (this.filters.status) {
      params['status'] = this.filters.status;
    }
    
    if (this.filters.crimeType) {
      params['crimeType'] = this.filters.crimeType;
    }
    
    // Build query string
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      url = `${url}?${queryString}`;
    }
    
    this.http.get<Complaint[]>(url)
      .subscribe({
        next: (data) => {
          this.complaints = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading complaints:', error);
          this.toastr.error('Failed to load complaints');
          this.loading = false;
        }
      });
  }

  resetFilters(): void {
    this.filters = {
      status: null,
      crimeType: null
    };
    this.loadComplaints();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatEnumValue(value: string): string {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUBMITTED': return 'status-badge status-submitted';
      case 'UNDER_REVIEW': return 'status-badge status-under-review';
      case 'ASSIGNED': return 'status-badge status-assigned';
      case 'INVESTIGATING': return 'status-badge status-investigating';
      case 'PENDING_EVIDENCE': return 'status-badge status-pending-evidence';
      case 'RESOLVED': return 'status-badge status-resolved';
      case 'REJECTED': return 'status-badge status-rejected';
      default: return '';
    }
  }

  openAssignmentModal(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.selectedOfficerId = complaint.assignedOfficer?.id || null;
    this.showAssignmentModal = true;
    this.loadOfficers();
  }

  closeAssignmentModal(): void {
    this.showAssignmentModal = false;
    this.selectedComplaint = null;
    this.selectedOfficerId = null;
  }

  loadOfficers(): void {
    this.loadingOfficers = true;
    this.http.get<PoliceOfficer[]>(`${environment.apiUrl}/admin/officers`)
      .subscribe({
        next: (data) => {
          this.officers = data;
          this.loadingOfficers = false;
        },
        error: (error) => {
          console.error('Error loading officers:', error);
          this.toastr.error('Failed to load officers');
          this.loadingOfficers = false;
        }
      });
  }

  assignOfficer(): void {
    if (!this.selectedComplaint || !this.selectedOfficerId) {
      this.toastr.error('Please select an officer to assign');
      return;
    }

    this.submitting = true;
    this.http.post(
      `${environment.apiUrl}/admin/complaints/${this.selectedComplaint.id}/assign/${this.selectedOfficerId}`,
      {}
    ).subscribe({
      next: () => {
        this.toastr.success('Complaint assigned successfully');
        this.closeAssignmentModal();
        this.loadComplaints();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error assigning complaint:', error);
        this.toastr.error('Failed to assign complaint');
        this.submitting = false;
      }
    });
  }
} 