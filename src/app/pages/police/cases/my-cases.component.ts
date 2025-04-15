import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PoliceService, AssignedComplaint } from '../../../core/services/police.service';
import { ComplaintService } from '../../../core/services/complaint.service';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-my-cases',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="flex items-center mb-4">
          <a routerLink="/police/assign" class="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to Complaints
          </a>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-8">My Cases</h1>
        
        <div class="flex justify-between items-center mb-6">
          <div class="text-gray-700">
            Manage and update the status of your assigned cases
          </div>
          
          <div class="flex gap-2">
            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="p-2 rounded border">
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="PENDING_EVIDENCE">Pending Evidence</option>
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
          <div *ngIf="filteredComplaints.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden mb-8">
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
                <tr *ngFor="let complaint of filteredComplaints">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">#{{ complaint.id }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ complaint.category || complaint.crimeType || 'N/A' }}</div>
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
                    {{ complaint.dateFiled | date:'MMM d, yyyy, h:mm a' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a (click)="viewComplaintDetails(complaint)" class="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer">View</a>
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
          
          <!-- Complaint Detail Modal View -->
          <div *ngIf="selectedComplaint" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="complaint-detail-title" role="dialog" aria-modal="true">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start justify-between mb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="complaint-detail-title">
                      Complaint #{{ selectedComplaint.id }}
                    </h3>
                    <button
                      (click)="selectedComplaint = null; commentText = ''"
                      class="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label="Close detail view">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div class="mb-6 flex justify-between items-start">
                    <div>
                      <div class="flex items-center space-x-4">
                        <span class="px-3 py-1 text-sm font-semibold rounded-full" 
                          [ngClass]="{
                            'bg-yellow-100 text-yellow-800': isStatusPending(selectedComplaint.status),
                            'bg-blue-100 text-blue-800': isStatusInvestigating(selectedComplaint.status),
                            'bg-green-100 text-green-800': isStatusResolved(selectedComplaint.status),
                            'bg-red-100 text-red-800': isStatusRejected(selectedComplaint.status)
                          }">
                          {{ formatStatus(selectedComplaint.status) }}
                        </span>
                        
                        <button 
                          *ngIf="canUpdateStatus(selectedComplaint)" 
                          (click)="openUpdateStatusDialog(selectedComplaint)" 
                          class="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 focus:outline-none">
                          Update Status
                        </button>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-500">Filed on: {{ selectedComplaint.dateFiled | date:'MMM d, yyyy, h:mm a' }}</p>
                      <p class="text-sm text-gray-500">Last updated: {{ selectedComplaint.dateLastUpdated | date:'MMM d, yyyy, h:mm a' }}</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-700 mb-2">Complainant Details</h3>
                      <p class="text-gray-600"><span class="font-medium">Name:</span> {{ selectedComplaint.userName }}</p>
                      <p class="text-gray-600"><span class="font-medium">User ID:</span> {{ selectedComplaint.userId }}</p>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-700 mb-2">Incident Details</h3>
                      <p class="text-gray-600"><span class="font-medium">Location:</span> {{ selectedComplaint.location || 'N/A' }}</p>
                      <p class="text-gray-600"><span class="font-medium">Type:</span> {{ selectedComplaint.category || selectedComplaint.crimeType || 'N/A' }}</p>
                      <p class="text-gray-600"><span class="font-medium">Priority:</span> {{ getPriorityLabel(selectedComplaint.priorityScore) }}</p>
                    </div>
                  </div>
                  
                  <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                    <p class="text-gray-600 whitespace-pre-line p-3 bg-gray-50 rounded border border-gray-200">
                      {{ selectedComplaint.description || 'No description provided.' }}
                    </p>
                  </div>
                  
                  <!-- Add Comment Form -->
                  <div class="mt-8 border-t pt-6">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Add a Comment</h3>
                    <div class="mb-4">
                      <textarea 
                        [(ngModel)]="commentText" 
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" 
                        rows="3" 
                        placeholder="Write your comment here..."></textarea>
                    </div>
                    <div class="flex justify-end">
                      <button 
                        (click)="submitComment()" 
                        [disabled]="!commentText.trim()" 
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        Submit Comment
                      </button>
                      <button 
                        (click)="selectedComplaint = null; commentText = ''" 
                        class="px-4 py-2 ml-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredComplaints.length === 0" class="bg-white shadow-md rounded-lg p-8 text-center">
            <p class="text-gray-500 mb-4">No assigned cases found.</p>
            <p class="text-gray-500">If you believe this is an error, please contact your supervisor.</p>
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
                      Update Status
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
export class MyCasesComponent implements OnInit {
  loading = true;
  complaints: AssignedComplaint[] = [];
  filteredComplaints: AssignedComplaint[] = [];
  statusFilter = '';
  priorityFilter = '';
  
  // Case details view
  selectedComplaint: AssignedComplaint | null = null;
  commentText = '';
  
  // Status update dialog
  showStatusDialog = false;
  selectedStatus = '';
  updateNotes = '';
  isUpdating = false;

  constructor(
    private policeService: PoliceService,
    private complaintService: ComplaintService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchAssignedComplaints();
  }

  fetchAssignedComplaints(): void {
    this.loading = true;
    
    this.policeService.getAssignedComplaints()
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch assigned cases:', error);
          this.toastr.error('Failed to load assigned cases', 'Error');
          this.loading = false;
          return of([]);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Assigned complaints from backend:', response);
          
          // Process the response to ensure crime type and dates are properly set
          this.complaints = response.map(complaint => {
            return {
              ...complaint,
              crimeType: complaint.category || complaint.crimeType || 'N/A',
              // Make sure we have proper date fields
              dateFiled: complaint.dateFiled || complaint.createdAt || new Date().toISOString(),
              dateLastUpdated: complaint.dateLastUpdated || complaint.updatedAt || complaint.dateFiled || new Date().toISOString()
            };
          });
          
          this.filteredComplaints = [...this.complaints];
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
    if (!score) return 'Low';
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
    this.selectedStatus = '';
    this.updateNotes = '';
  }

  updateStatus(): void {
    if (!this.selectedComplaint || !this.selectedStatus) {
      return;
    }
    
    this.isUpdating = true;
    
    this.policeService.updateComplaintStatus(this.selectedComplaint.id, this.selectedStatus, this.updateNotes)
      .subscribe({
        next: (response) => {
          // Update the complaint in the list
          const index = this.complaints.findIndex(c => c.id === this.selectedComplaint?.id);
          if (index !== -1) {
            this.complaints[index].status = this.selectedStatus;
            this.complaints[index].dateLastUpdated = new Date().toISOString();
            
            // Also update the selected complaint if it's still displayed
            if (this.selectedComplaint) {
              this.selectedComplaint.status = this.selectedStatus;
              this.selectedComplaint.dateLastUpdated = new Date().toISOString();
            }
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
  
  submitComment(): void {
    if (!this.commentText.trim() || !this.selectedComplaint) {
      return;
    }
    
    // In a real application, this would call a service method to save the comment
    this.toastr.success('Comment submitted successfully');
    this.commentText = '';
  }

  viewComplaintDetails(complaint: AssignedComplaint): void {
    this.selectedComplaint = { ...complaint }; // Set initially with basic data
    
    // Load complete complaint details from the backend to ensure we have all data
    this.complaintService.getComplaintById(complaint.id).subscribe({
      next: (fullComplaint) => {
        console.log('Full complaint details from backend:', fullComplaint);
        
        // Update the view with complete data, handling the different field names
        this.selectedComplaint = {
          ...this.selectedComplaint,
          ...fullComplaint,
          // Ensure we have the crime type (either from category or crimeType fields)
          crimeType: fullComplaint.category || fullComplaint.crimeType || complaint.crimeType,
          // Ensure we have dates
          dateFiled: fullComplaint.dateFiled || fullComplaint.createdAt || complaint.dateFiled,
          dateLastUpdated: fullComplaint.dateLastUpdated || fullComplaint.updatedAt || complaint.dateLastUpdated
        };
      },
      error: (error) => {
        console.error('Error fetching complaint details:', error);
        this.toastr.error('Failed to load complete complaint details');
      }
    });
  }
  
  formatDate(date: string | number | Date): string {
    if (!date) return 'N/A';
    
    try {
      // Convert string/number to Date object
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
        return 'N/A';
      }
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return dateObj.toLocaleString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'N/A';
    }
  }
} 