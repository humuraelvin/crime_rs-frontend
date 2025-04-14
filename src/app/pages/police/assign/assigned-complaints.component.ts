import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ComplaintService } from '../../../core/services/complaint.service';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface AssignedComplaint {
  id: number;
  userId: number;
  userName: string;
  crimeType: string;
  description: string;
  status: string;
  dateFiled: string;
  dateLastUpdated: string;
  location: string;
  priorityScore: number;
  evidences?: any[];
}

@Component({
  selector: 'app-assigned-complaints',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Assigned Complaints</h1>
          
          <div class="flex gap-2">
            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="p-2 rounded border">
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PENDING">Pending</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <select [(ngModel)]="priorityFilter" (change)="applyFilters()" class="p-2 rounded border">
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        
        <div *ngIf="loading" class="flex justify-center my-12">
          <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
        </div>
        
        <div *ngIf="!loading">
          <div *ngIf="complaints.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Filed</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let complaint of complaints">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">#{{ complaint.id }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ complaint.crimeType }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ complaint.userName }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{
                            'bg-yellow-100 text-yellow-800': isStatusPending(complaint.status),
                            'bg-blue-100 text-blue-800': isStatusInvestigating(complaint.status),
                            'bg-green-100 text-green-800': isStatusResolved(complaint.status),
                            'bg-red-100 text-red-800': isStatusRejected(complaint.status)
                          }">
                      {{ formatStatus(complaint.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{
                            'bg-red-100 text-red-800': getPriorityLabel(complaint.priorityScore) === 'High',
                            'bg-orange-100 text-orange-800': getPriorityLabel(complaint.priorityScore) === 'Medium',
                            'bg-green-100 text-green-800': getPriorityLabel(complaint.priorityScore) === 'Low'
                          }">
                      {{ getPriorityLabel(complaint.priorityScore) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ complaint.dateFiled | date:'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a [routerLink]="['/complaints', complaint.id]" class="text-indigo-600 hover:text-indigo-900 mr-3">View</a>
                    <button 
                      *ngIf="canUpdateStatus(complaint)" 
                      (click)="openUpdateStatusDialog(complaint)" 
                      class="text-blue-600 hover:text-blue-900">
                      Update Status
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div *ngIf="complaints.length === 0" class="bg-white shadow-md rounded-lg p-8 text-center">
            <p class="text-gray-500 mb-4">No complaints have been assigned to you yet.</p>
            <p class="text-gray-500">Check back later or contact your supervisor if you believe this is an error.</p>
          </div>
        </div>
        
        <!-- Status Update Dialog -->
        <div *ngIf="showStatusDialog" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Update Complaint Status
                    </h3>
                    <div class="mt-4">
                      <p class="text-sm text-gray-500 mb-4">
                        Update the status of complaint #{{ selectedComplaint?.id }}
                      </p>
                      <div class="mb-4">
                        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" name="status" [(ngModel)]="selectedStatus" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                          <option value="INVESTIGATING">Investigating</option>
                          <option value="PENDING_EVIDENCE">Pending Evidence</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                      <div class="mb-4">
                        <label for="notes" class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea id="notes" name="notes" [(ngModel)]="updateNotes" rows="3" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Add notes about this status update"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" (click)="updateStatus()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm" [disabled]="isUpdating">
                  <span *ngIf="!isUpdating">Save Changes</span>
                  <span *ngIf="isUpdating">Updating...</span>
                </button>
                <button type="button" (click)="closeUpdateStatusDialog()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AssignedComplaintsComponent implements OnInit {
  loading = true;
  complaints: AssignedComplaint[] = [];
  filteredComplaints: AssignedComplaint[] = [];
  statusFilter = '';
  priorityFilter = '';
  
  // Status update dialog
  showStatusDialog = false;
  selectedComplaint: AssignedComplaint | null = null;
  selectedStatus = '';
  updateNotes = '';
  isUpdating = false;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit(): void {
    this.fetchAssignedComplaints();
  }

  fetchAssignedComplaints(): void {
    this.loading = true;
    
    // Example data for demonstration in case API fails
    const demoComplaints: AssignedComplaint[] = [
      {
        id: 101,
        userId: 5,
        userName: 'John Smith',
        crimeType: 'THEFT',
        description: 'My bike was stolen from outside my apartment on Main Street.',
        status: 'ASSIGNED',
        dateFiled: new Date().toISOString(),
        dateLastUpdated: new Date().toISOString(),
        location: '123 Main St, City',
        priorityScore: 7
      },
      {
        id: 102,
        userId: 8,
        userName: 'Emma Johnson',
        crimeType: 'ASSAULT',
        description: 'I was attacked while walking in the park yesterday evening.',
        status: 'INVESTIGATING',
        dateFiled: new Date().toISOString(),
        dateLastUpdated: new Date().toISOString(),
        location: 'City Park',
        priorityScore: 9
      },
      {
        id: 103,
        userId: 12,
        userName: 'Michael Davis',
        crimeType: 'VANDALISM',
        description: 'Someone spray painted graffiti on my garage door overnight.',
        status: 'RESOLVED',
        dateFiled: new Date().toISOString(),
        dateLastUpdated: new Date().toISOString(),
        location: '456 Oak Ave, City',
        priorityScore: 4
      }
    ];
    
    this.http.get<AssignedComplaint[]>(`${environment.apiUrl}/police/complaints/assigned`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to fetch assigned complaints:', error);
          this.toastr.warning('Using example data - API endpoint is under development', 'Connection Issue');
          return of(demoComplaints);
        })
      )
      .subscribe({
        next: (response) => {
          this.complaints = response;
          this.filteredComplaints = [...this.complaints];
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredComplaints = this.complaints.filter(complaint => {
      let includeByStatus = !this.statusFilter || complaint.status === this.statusFilter;
      
      let includeByPriority = true;
      if (this.priorityFilter) {
        const priority = this.getPriorityLabel(complaint.priorityScore).toLowerCase();
        includeByPriority = priority === this.priorityFilter.toLowerCase();
      }
      
      return includeByStatus && includeByPriority;
    });
  }

  getPriorityLabel(score: number): string {
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  }

  formatStatus(status: string): string {
    if (!status) return 'Unknown';
    
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  isStatusPending(status: string): boolean {
    return status === 'ASSIGNED' || status === 'PENDING' || status === 'PENDING_EVIDENCE';
  }

  isStatusInvestigating(status: string): boolean {
    return status === 'INVESTIGATING' || status === 'UNDER_REVIEW';
  }

  isStatusResolved(status: string): boolean {
    return status === 'RESOLVED' || status === 'CLOSED';
  }

  isStatusRejected(status: string): boolean {
    return status === 'REJECTED';
  }

  canUpdateStatus(complaint: AssignedComplaint): boolean {
    // Police officers can update status of assigned or investigating complaints
    return complaint.status !== 'REJECTED' && complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED';
  }

  openUpdateStatusDialog(complaint: AssignedComplaint): void {
    this.selectedComplaint = complaint;
    this.selectedStatus = complaint.status === 'ASSIGNED' ? 'INVESTIGATING' : complaint.status;
    this.updateNotes = '';
    this.showStatusDialog = true;
  }

  closeUpdateStatusDialog(): void {
    this.showStatusDialog = false;
    this.selectedComplaint = null;
    this.selectedStatus = '';
    this.updateNotes = '';
  }

  updateStatus(): void {
    if (!this.selectedComplaint || !this.selectedStatus) {
      return;
    }
    
    this.isUpdating = true;
    
    // Replace with actual API call
    this.complaintService.updateComplaintStatus(this.selectedComplaint.id, this.selectedStatus)
      .subscribe({
        next: (response) => {
          // Update the complaint in the list
          const index = this.complaints.findIndex(c => c.id === this.selectedComplaint?.id);
          if (index !== -1) {
            this.complaints[index].status = this.selectedStatus;
            this.complaints[index].dateLastUpdated = new Date().toISOString();
          }
          
          this.toastr.success(`Complaint status updated to ${this.formatStatus(this.selectedStatus)}`);
          this.isUpdating = false;
          this.closeUpdateStatusDialog();
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to update complaint status:', error);
          this.toastr.error('Failed to update complaint status');
          this.isUpdating = false;
          // Don't close dialog to allow retry
        }
      });
  }
} 