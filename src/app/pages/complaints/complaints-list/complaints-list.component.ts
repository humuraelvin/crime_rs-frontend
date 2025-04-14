import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComplaintService, ComplaintResponse } from '../../../core/services/complaint.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

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

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Complaints</h1>
          <button 
            *ngIf="isCitizen"
            routerLink="/complaints/create"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span class="material-icons mr-2">add</span>
            New Complaint
          </button>
        </div>
        
        <!-- Complaints List -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngIf="loading" class="text-center">
                <td colspan="5" class="px-6 py-4">
                  <div class="flex justify-center items-center">
                    <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="ml-2">Loading complaints...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading && complaints.length === 0" class="text-center">
                <td colspan="5" class="px-6 py-4">
                  <p class="text-gray-500">No complaints found</p>
                  <button *ngIf="isCitizen" 
                          routerLink="/complaints/create"
                          class="mt-2 text-blue-600 hover:text-blue-800">
                    Create your first complaint
                  </button>
                </td>
              </tr>
              <tr *ngFor="let complaint of complaints">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{complaint.id}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{complaint.crimeType}}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [ngClass]="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-100 text-yellow-800': complaint.status === 'SUBMITTED',
                    'bg-blue-100 text-blue-800': complaint.status === 'UNDER_REVIEW',
                    'bg-green-100 text-green-800': complaint.status === 'RESOLVED'
                  }">
                    {{complaint.status}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{complaint.dateFiled | date:'medium'}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a [routerLink]="['/complaints', complaint.id]" class="text-blue-600 hover:text-blue-900">View</a>
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
export class ComplaintsListComponent implements OnInit {
  complaints: ComplaintResponse[] = [];
  loading = true;
  isCitizen = false;
  isAdmin = false;
  isPoliceOfficer = false;

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
      // For citizens, only show their own complaints
      console.log('Loading complaints for citizen');
      observable = this.complaintService.getMyComplaints();
    } else if (this.isAdmin || this.isPoliceOfficer) {
      // For admin/police, show all complaints
      console.log('Loading all complaints for admin/police');
      observable = this.complaintService.getComplaints();
    }

    observable.subscribe({
      next: (data: any) => {
        // Check if the response is paginated
        if (data && data.content && Array.isArray(data.content)) {
          this.complaints = data.content;
        } else if (Array.isArray(data)) {
          // If response is already an array
          this.complaints = data;
        } else {
          console.error('Unexpected data format:', data);
          this.complaints = [];
          this.toastr.error('Invalid data format received from server');
        }
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
} 