import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@environments/environment';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface PoliceOfficer {
  id: number;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  departmentName: string;
  rank: string;
  specialization: string;
  activeCasesCount: number;
}

interface Complaint {
  id: number;
  title?: string;
  description: string;
  location: string;
  incidentDate?: string;
  dateFiled: string;
  dateLastUpdated: string;
  status: string;
  crimeType: string;
  category?: string;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  userId: number;
  userName: string;
  createdAt?: string;
  priorityScore?: number;
}

@Component({
  selector: 'app-complaint-assignment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    FormsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Complaint Assignment</h1>
      </div>

      <div *ngIf="loading" class="flex justify-center my-8">
        <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
      </div>

      <div *ngIf="!loading">
        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
              <select
                (change)="applyFilters()"
                [(ngModel)]="statusFilter"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category Filter</label>
              <select
                (change)="applyFilters()"
                [(ngModel)]="categoryFilter"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option value="THEFT">Theft</option>
                <option value="ASSAULT">Assault</option>
                <option value="FRAUD">Fraud</option>
                <option value="VANDALISM">Vandalism</option>
                <option value="DOMESTIC_VIOLENCE">Domestic Violence</option>
                <option value="CYBERCRIME">Cybercrime</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
                placeholder="Search complaints..."
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Complaints List -->
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg shadow-md">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let complaint of filteredComplaints" class="hover:bg-gray-50">
                <td class="py-3 px-4 whitespace-nowrap">{{complaint.id}}</td>
                <td class="py-3 px-4">{{complaint.description | slice:0:30}}{{complaint.description.length > 30 ? '...' : ''}}</td>
                <td class="py-3 px-4">{{complaint.category}}</td>
                <td class="py-3 px-4">{{complaint.location}}</td>
                <td class="py-3 px-4">{{(complaint.dateFiled | date:'shortDate') || 'N/A'}}</td>
                <td class="py-3 px-4">
                  <span [ngClass]="getStatusClass(complaint.status)">{{complaint.status}}</span>
                </td>
                <td class="py-3 px-4">
                  <span *ngIf="complaint.assignedOfficerName">{{complaint.assignedOfficerName}}</span>
                  <span *ngIf="!complaint.assignedOfficerName" class="text-gray-500">Not Assigned</span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <button
                    (click)="openAssignmentModal(complaint)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                    [disabled]="complaint.status === 'RESOLVED' || complaint.status === 'CLOSED'"
                    [ngClass]="{'text-gray-400': complaint.status === 'RESOLVED' || complaint.status === 'CLOSED'}"
                  >
                    <span class="material-icons text-sm">assignment_ind</span>
                    Assign
                  </button>
                  <button
                    (click)="viewDetails(complaint)"
                    class="text-green-600 hover:text-green-900"
                  >
                    <span class="material-icons text-sm">visibility</span>
                    View
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredComplaints.length === 0">
                <td colspan="8" class="py-4 px-4 text-center text-gray-500">
                  No complaints found matching your criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <div *ngIf="showAssignmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-2xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Assign Officer to Complaint</h2>
          <button (click)="closeAssignmentModal()" class="text-gray-500 hover:text-gray-700">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div *ngIf="modalLoading" class="flex justify-center my-4">
          <app-loading-spinner [size]="'md'" [color]="'primary'"></app-loading-spinner>
        </div>

        <div *ngIf="!modalLoading">
          <div class="mb-4">
            <h3 class="font-medium">Complaint Details:</h3>
            <p><span class="font-medium">ID:</span> {{selectedComplaint?.id}}</p>
            <p><span class="font-medium">Description:</span> {{selectedComplaint?.description}}</p>
            <p><span class="font-medium">Category:</span> {{selectedComplaint?.category}}</p>
            <p><span class="font-medium">Status:</span> {{selectedComplaint?.status}}</p>
            <p *ngIf="selectedComplaint?.assignedOfficerName">
              <span class="font-medium">Currently Assigned To:</span> {{selectedComplaint?.assignedOfficerName}}
            </p>
          </div>

          <form [formGroup]="assignmentForm" (ngSubmit)="assignOfficer()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Select Officer</label>
              <select
                formControlName="officerId"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option [ngValue]="null">-- Select an Officer --</option>
                <option *ngFor="let officer of officers" [ngValue]="officer.id">
                  {{officer.firstName}} {{officer.lastName}} ({{officer.badgeNumber}}) - {{officer.departmentName}} - Active Cases: {{officer.activeCasesCount}}
                </option>
              </select>
              <div *ngIf="assignmentForm.get('officerId')?.touched && assignmentForm.get('officerId')?.errors?.['required']" class="text-red-500 text-sm mt-1">
                Please select an officer.
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <select
                formControlName="status"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ASSIGNED">Assigned</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="PENDING_EVIDENCE">Pending Evidence</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                formControlName="notes"
                rows="3"
                placeholder="Add any notes about this assignment..."
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="closeAssignmentModal()"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2">
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="assignmentForm.invalid || submitting"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center">
                <span *ngIf="submitting" class="mr-2">
                  <app-loading-spinner [size]="'sm'" [color]="'white'"></app-loading-spinner>
                </span>
                <span>Assign Officer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ComplaintAssignmentComponent implements OnInit {
  // Complaint list properties
  loading: boolean = true;
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];

  // Filters
  statusFilter: string = '';
  categoryFilter: string = '';
  searchQuery: string = '';

  // Assignment modal properties
  showAssignmentModal: boolean = false;
  modalLoading: boolean = false;
  selectedComplaint: Complaint | null = null;
  officers: PoliceOfficer[] = [];
  assignmentForm: FormGroup;
  submitting: boolean = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.assignmentForm = this.fb.group({
      officerId: [null, Validators.required],
      status: ['ASSIGNED'],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/admin/complaints/all`)
      .subscribe({
        next: (complaints) => {
          // Map backend response to our frontend model
          this.complaints = complaints.map(complaint => {
            return {
              id: complaint.id,
              description: complaint.description || 'No description',
              location: complaint.location || 'Unknown location',
              dateFiled: complaint.dateFiled || complaint.createdAt || new Date().toISOString(),
              dateLastUpdated: complaint.dateLastUpdated,
              status: complaint.status,
              crimeType: complaint.crimeType,
              category: complaint.category || complaint.crimeType || 'Uncategorized',
              userId: complaint.userId,
              userName: complaint.userName,
              priorityScore: complaint.priorityScore,
              assignedOfficerId: complaint.assignedOfficerId,
              assignedOfficerName: complaint.assignedOfficerName,
              createdAt: complaint.createdAt
            };
          });

          this.filteredComplaints = [...this.complaints];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading complaints', error);
          this.toastr.error('Failed to load complaints. Please try again.');
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredComplaints = this.complaints.filter(complaint => {
      const matchesStatus = !this.statusFilter || complaint.status === this.statusFilter;
      const matchesCategory = !this.categoryFilter || complaint.category === this.categoryFilter;
      const matchesSearch = !this.searchQuery ||
        (complaint.description && complaint.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (complaint.location && complaint.location.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (complaint.assignedOfficerName && complaint.assignedOfficerName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUBMITTED':
        return 'px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800';
      case 'ASSIGNED':
        return 'px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800';
      case 'INVESTIGATING':
        return 'px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800';
      case 'PENDING_EVIDENCE':
        return 'px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800';
      case 'REJECTED':
        return 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-800';
      case 'CLOSED':
        return 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
      case 'RESOLVED':
        return 'px-2 py-1 rounded-full text-xs bg-green-100 text-green-800';
      default:
        return 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
    }
  }

  openAssignmentModal(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.showAssignmentModal = true;
    this.modalLoading = true;

    // Reset the form
    this.assignmentForm.reset({
      officerId: null,
      status: 'ASSIGNED',
      notes: ''
    });

    // Load officers
    this.http.get<PoliceOfficer[]>(`${environment.apiUrl}/admin/officers`)
      .subscribe({
        next: (officers) => {
          this.officers = officers;
          this.modalLoading = false;

          // If complaint already has an assigned officer, pre-select them
          if (complaint.assignedOfficerId) {
            this.assignmentForm.patchValue({
              officerId: complaint.assignedOfficerId
            });
          }
        },
        error: (error) => {
          console.error('Error loading officers', error);
          this.toastr.error('Failed to load officers. Please try again.');
          this.modalLoading = false;
          this.closeAssignmentModal();
        }
      });
  }

  closeAssignmentModal(): void {
    this.showAssignmentModal = false;
    this.selectedComplaint = null;
  }

  assignOfficer(): void {
    if (this.assignmentForm.invalid || !this.selectedComplaint) {
      return;
    }

    this.submitting = true;
    const assignmentData = this.assignmentForm.value;

    this.http.post(`${environment.apiUrl}/admin/complaints/${this.selectedComplaint.id}/assign`, assignmentData)
      .subscribe({
        next: () => {
          const officer = this.officers.find(o => o.id === assignmentData.officerId);
          const officerName = officer ? `${officer.firstName} ${officer.lastName}` : 'Unknown';

          this.toastr.success(`Complaint #${this.selectedComplaint?.id} assigned to ${officerName}`);
          this.submitting = false;
          this.closeAssignmentModal();
          this.loadComplaints(); // Reload the complaints list
        },
        error: (error) => {
          console.error('Error assigning officer', error);
          this.toastr.error(error.error?.message || 'Failed to assign officer. Please try again.');
          this.submitting = false;
        }
      });
  }

  viewDetails(complaint: Complaint): void {
    this.router.navigate(['/admin/complaints', complaint.id]);
  }
}
