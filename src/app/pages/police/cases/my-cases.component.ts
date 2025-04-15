import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PoliceService, AssignedComplaint } from '../../../core/services/police.service';
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
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filed On</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let complaint of filteredComplaints">
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ complaint.dateLastUpdated | date:'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      (click)="viewDetails(complaint)" 
                      class="text-indigo-600 hover:text-indigo-900 mr-3">
                      View Details
                    </button>
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
          
          <div *ngIf="selectedComplaint" class="bg-white shadow-md rounded-lg mb-8 p-6">
            <div class="flex justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900">Case Details #{{ selectedComplaint.id }}</h2>
              <button 
                (click)="selectedComplaint = null" 
                class="text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">Complaint Information</h3>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Crime Type:</span>
                  <span class="ml-2">{{ selectedComplaint.crimeType }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Status:</span>
                  <span class="ml-2">{{ formatStatus(selectedComplaint.status) }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Priority:</span>
                  <span class="ml-2">{{ getPriorityLabel(selectedComplaint.priorityScore) }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Location:</span>
                  <span class="ml-2">{{ selectedComplaint.location || 'Not specified' }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Filed On:</span>
                  <span class="ml-2">{{ selectedComplaint.dateFiled | date:'medium' }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Last Updated:</span>
                  <span class="ml-2">{{ selectedComplaint.dateLastUpdated | date:'medium' }}</span>
                </div>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold mb-3">Reporting User Information</h3>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Name:</span>
                  <span class="ml-2">{{ selectedComplaint.userName }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-gray-600 font-medium">Description:</span>
                  <div class="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                    {{ selectedComplaint.description }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end">
              <button 
                *ngIf="canUpdateStatus(selectedComplaint)"
                (click)="openUpdateStatusDialog(selectedComplaint)" 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Update Status
              </button>
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
                      Update Case Status
                    </h3>
                    <div class="mt-4">
                      <p class="text-sm text-gray-500 mb-4">
                        Update the status of case #{{ selectedComplaint?.id }}
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
  
  // Status update dialog
  showStatusDialog = false;
  selectedStatus = '';
  updateNotes = '';
  isUpdating = false;

  constructor(
    private policeService: PoliceService,
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
          this.complaints = response;
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
  
  viewDetails(complaint: AssignedComplaint): void {
    this.selectedComplaint = complaint;
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
          
          this.toastr.success(`Case status updated to ${this.formatStatus(this.selectedStatus)}`);
          this.isUpdating = false;
          this.closeUpdateStatusDialog();
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to update case status:', error);
          this.toastr.error('Failed to update case status');
          this.isUpdating = false;
          // Don't close dialog to allow retry
        }
      });
  }
} 