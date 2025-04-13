import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface Complaint {
  id: number;
  title: string;
  description: string;
  location: string;
  status: string;
  userId: number;
  submitterName: string;
  assignedOfficerId: number | null;
  assignedOfficerName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PoliceOfficer {
  id: number;
  firstName: string;
  lastName: string;
  badgeNumber: string;
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
        <h1 class="text-2xl font-bold text-gray-800">Complaint Management</h1>
      </div>

      <div *ngIf="loading" class="flex justify-center my-8">
        <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
      </div>

      <div *ngIf="!loading">
        <div class="mb-4 flex items-center space-x-4">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span class="material-icons text-gray-500">search</span>
            </div>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search complaints..."
            >
          </div>
          <div>
            <select 
              [(ngModel)]="statusFilter"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="PENDING_EVIDENCE">Pending Evidence</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <div *ngIf="complaints.length === 0" class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-gray-600">No complaints found.</p>
        </div>

        <div *ngIf="complaints.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let complaint of complaints">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{complaint.id}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{complaint.title}}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': complaint.status === 'SUBMITTED',
                      'bg-blue-100 text-blue-800': complaint.status === 'UNDER_REVIEW',
                      'bg-indigo-100 text-indigo-800': complaint.status === 'ASSIGNED',
                      'bg-purple-100 text-purple-800': complaint.status === 'INVESTIGATING',
                      'bg-orange-100 text-orange-800': complaint.status === 'PENDING_EVIDENCE',
                      'bg-red-100 text-red-800': complaint.status === 'REJECTED',
                      'bg-gray-100 text-gray-800': complaint.status === 'CLOSED',
                      'bg-green-100 text-green-800': complaint.status === 'RESOLVED'
                    }">
                    {{complaint.status.replace('_', ' ') | titlecase}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{complaint.submitterName}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{complaint.assignedOfficerName || 'Not Assigned'}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{complaint.createdAt | date:'short'}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="openAssignmentModal(complaint)" 
                          class="text-indigo-600 hover:text-indigo-900 mr-2">
                    <span class="material-icons text-sm">assignment_ind</span>
                  </button>
                  <button (click)="openStatusModal(complaint)" 
                          class="text-blue-600 hover:text-blue-900 mr-2">
                    <span class="material-icons text-sm">update</span>
                  </button>
                  <button (click)="viewComplaintDetails(complaint)" 
                          class="text-green-600 hover:text-green-900">
                    <span class="material-icons text-sm">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <div *ngIf="assignmentModalVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold mb-4">Assign Complaint</h3>
        <p class="mb-4">
          <span class="font-semibold">Complaint:</span> {{selectedComplaint?.title}}
        </p>
        
        <div *ngIf="loadingOfficers" class="flex justify-center my-4">
          <app-loading-spinner [size]="'md'" [color]="'primary'"></app-loading-spinner>
        </div>
        
        <div *ngIf="!loadingOfficers">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Select Officer
            </label>
            <select 
              [(ngModel)]="selectedOfficerId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option [value]="null">- Unassign -</option>
              <option *ngFor="let officer of officers" [value]="officer.id">
                {{officer.firstName}} {{officer.lastName}} ({{officer.badgeNumber}}) - {{officer.departmentName}} - Active cases: {{officer.activeCasesCount}}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button 
            (click)="assignmentModalVisible = false"
            class="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            (click)="assignOfficer()"
            [disabled]="assigningOfficer"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            <span *ngIf="assigningOfficer">Assigning...</span>
            <span *ngIf="!assigningOfficer">Assign</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div *ngIf="statusModalVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold mb-4">Update Complaint Status</h3>
        <p class="mb-4">
          <span class="font-semibold">Complaint:</span> {{selectedComplaint?.title}}
        </p>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Current Status: 
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              [ngClass]="{
                'bg-yellow-100 text-yellow-800': selectedComplaint?.status === 'SUBMITTED',
                'bg-blue-100 text-blue-800': selectedComplaint?.status === 'UNDER_REVIEW',
                'bg-indigo-100 text-indigo-800': selectedComplaint?.status === 'ASSIGNED',
                'bg-purple-100 text-purple-800': selectedComplaint?.status === 'INVESTIGATING',
                'bg-orange-100 text-orange-800': selectedComplaint?.status === 'PENDING_EVIDENCE',
                'bg-red-100 text-red-800': selectedComplaint?.status === 'REJECTED',
                'bg-gray-100 text-gray-800': selectedComplaint?.status === 'CLOSED',
                'bg-green-100 text-green-800': selectedComplaint?.status === 'RESOLVED'
              }">
                {{selectedComplaint?.status?.replace('_', ' ') | titlecase}}
              </span>
          </label>
          <select 
            [(ngModel)]="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="PENDING_EVIDENCE">Pending Evidence</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Closed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button 
            (click)="statusModalVisible = false"
            class="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            (click)="updateStatus()"
            [disabled]="updatingStatus"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            <span *ngIf="updatingStatus">Updating...</span>
            <span *ngIf="!updatingStatus">Update</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ComplaintAssignmentComponent implements OnInit {
  loading = true;
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  searchTerm = '';
  statusFilter = '';
  
  // Assignment modal
  assignmentModalVisible = false;
  selectedComplaint: Complaint | null = null;
  selectedOfficerId: number | null = null;
  loadingOfficers = false;
  officers: PoliceOfficer[] = [];
  assigningOfficer = false;
  
  // Status modal
  statusModalVisible = false;
  selectedStatus = '';
  updatingStatus = false;
  
  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading = true;
    this.http.get<Complaint[]>(`${environment.apiUrl}/api/complaints`)
      .subscribe({
        next: (data) => {
          this.complaints = data;
          this.filteredComplaints = [...data];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading complaints', error);
          this.toastr.error('Failed to load complaints', 'Error');
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredComplaints = this.complaints.filter(complaint => {
      const matchesSearch = this.searchTerm === '' || 
        complaint.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        complaint.submitterName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (complaint.assignedOfficerName && complaint.assignedOfficerName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = this.statusFilter === '' || complaint.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  openAssignmentModal(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.selectedOfficerId = complaint.assignedOfficerId;
    this.assignmentModalVisible = true;
    this.loadOfficers();
  }

  loadOfficers(): void {
    this.loadingOfficers = true;
    this.http.get<PoliceOfficer[]>(`${environment.apiUrl}/api/officers`)
      .subscribe({
        next: (data) => {
          this.officers = data;
          this.loadingOfficers = false;
        },
        error: (error) => {
          console.error('Error loading officers', error);
          this.toastr.error('Failed to load officers', 'Error');
          this.loadingOfficers = false;
        }
      });
  }

  assignOfficer(): void {
    if (!this.selectedComplaint) return;
    
    this.assigningOfficer = true;
    
    this.http.patch(`${environment.apiUrl}/api/complaints/${this.selectedComplaint.id}/assign`, {
      officerId: this.selectedOfficerId
    }).subscribe({
      next: () => {
        this.toastr.success(
          this.selectedOfficerId 
            ? 'Complaint assigned successfully' 
            : 'Complaint unassigned successfully', 
          'Success'
        );
        this.assigningOfficer = false;
        this.assignmentModalVisible = false;
        this.loadComplaints();
      },
      error: (error) => {
        console.error('Error assigning officer', error);
        this.toastr.error('Failed to assign officer', 'Error');
        this.assigningOfficer = false;
      }
    });
  }

  openStatusModal(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.selectedStatus = complaint.status;
    this.statusModalVisible = true;
  }

  updateStatus(): void {
    if (!this.selectedComplaint) return;
    
    this.updatingStatus = true;
    
    this.http.patch(`${environment.apiUrl}/api/complaints/${this.selectedComplaint.id}/status`, {
      status: this.selectedStatus
    }).subscribe({
      next: () => {
        this.toastr.success('Complaint status updated successfully', 'Success');
        this.updatingStatus = false;
        this.statusModalVisible = false;
        this.loadComplaints();
      },
      error: (error) => {
        console.error('Error updating status', error);
        this.toastr.error('Failed to update status', 'Error');
        this.updatingStatus = false;
      }
    });
  }

  viewComplaintDetails(complaint: Complaint): void {
    // This would typically navigate to a detail view
    console.log('View complaint details', complaint);
    this.toastr.info('Complaint details view not implemented yet', 'Info');
  }
} 