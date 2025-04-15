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

interface RawComplaintData extends Partial<ComplaintResponse> {
  type?: string;
  crime_type?: string;
  complaint_type?: string;
  complaintType?: string;
  createTime?: string;
  createdAt?: string;
  created_at?: string;
  updateTime?: string;
  updatedAt?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">My Submitted Complaints</h1>
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngIf="loading" class="text-center">
                <td colspan="7" class="px-6 py-4">
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
                <td colspan="7" class="px-6 py-4">
                  <p class="text-gray-500">No complaints found</p>
                  <button *ngIf="isCitizen" 
                          routerLink="/complaints/create"
                          class="mt-2 text-blue-600 hover:text-blue-800">
                    Create your first complaint
                  </button>
                </td>
              </tr>
              <tr *ngFor="let complaint of complaints" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{complaint.id}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{complaint.crimeType}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{complaint.category || 'N/A'}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{complaint.location || 'N/A'}}</td>
                <td class="px-6 py-4 whitespace-nowrap">
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex flex-col">
                    <span>Filed: {{formatDate(complaint.dateFiled)}}</span>
                    <span class="text-xs">Updated: {{formatDate(complaint.dateLastUpdated)}}</span>
                  </div>
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
        console.log('Raw complaint data:', data); // Add debugging
        
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
        console.log('Processed complaints:', this.complaints); // Add debugging
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

  // Helper method to map complaint data
  private mapComplaintData(rawComplaint: RawComplaintData): ComplaintResponse {
    if (!rawComplaint) return {} as ComplaintResponse;

    // Log the incoming complaint data to debug TYPE field
    console.log('Mapping complaint data:', rawComplaint);
    
    // Look for TYPE in all possible fields
    const typeValue = this.extractTypeField(rawComplaint);
    console.log('Extracted TYPE value:', typeValue);
    
    const complaint: ComplaintResponse = {
      id: rawComplaint.id || 0,
      userId: rawComplaint.userId || 0,
      userName: rawComplaint.userName || 'Unknown',
      crimeType: typeValue,
      category: rawComplaint.category || 'N/A',
      description: rawComplaint.description || '',
      status: rawComplaint.status || 'PENDING',
      dateFiled: rawComplaint.dateFiled || rawComplaint.createdAt || rawComplaint.createTime || rawComplaint.created_at || new Date().toISOString(),
      dateLastUpdated: rawComplaint.dateLastUpdated || rawComplaint.updatedAt || rawComplaint.updateTime || rawComplaint.updated_at || new Date().toISOString(),
      location: rawComplaint.location || 'N/A',
      priorityScore: rawComplaint.priorityScore || 0,
      evidences: rawComplaint.evidences || [],
      comments: rawComplaint.comments || []
    };

    return complaint;
  }
  
  // Helper to extract type value from all possible field names
  private extractTypeField(complaint: any): string {
    // Log the FULL object in raw JSON format
    console.log('Raw complaint JSON:', JSON.stringify(complaint, null, 2));
    
    // Look for exact key with "type" in it
    console.log('Object keys:', Object.keys(complaint));
    
    // Convert to regular object to access dynamically
    const obj = { ...complaint };
    
    // Based on the console logs, title or category field should be used for TYPE
    if (obj.title) {
      console.log('Using title for type:', obj.title);
      return obj.title;
    }
    
    if (obj.category) {
      console.log('Using category for type:', obj.category);
      return obj.category;
    }
    
    // Special handling for backend fields structure
    // Direct extraction of type if we find a known structure
    if (obj.crime && obj.crime.type) {
      console.log('Found crime.type:', obj.crime.type);
      return obj.crime.type;
    }
    
    if (obj.complaint && obj.complaint.type) {
      console.log('Found complaint.type:', obj.complaint.type);
      return obj.complaint.type;
    }
    
    // First priority - extract from direct types
    if (obj.crimeType) return obj.crimeType;
    if (obj.type) return obj.type;
    
    // Check for any field that contains 'type' case-insensitive
    for (const key in obj) {
      if (typeof obj[key] === 'string' && key.toLowerCase().includes('type')) {
        console.log(`Found type-like field: ${key} = ${obj[key]}`);
        if (obj[key]) return obj[key];
      }
    }
    
    // Try all possible field names for type as a backup
    const possibleFields = [
      'crimeType', 'type', 'crime_type', 'complaintType', 
      'complaint_type', 'crimetype', 'CRIME_TYPE'
    ];
    
    // Check specific known field names
    for (const field of possibleFields) {
      if (obj[field]) {
        console.log(`Found in known fields: ${field} = ${obj[field]}`);
        return obj[field];
      }
    }
    
    // Last resort - examine nested objects
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        console.log(`Checking nested object: ${key}`);
        for (const nestedKey in obj[key]) {
          if (nestedKey.toLowerCase().includes('type')) {
            console.log(`Found nested type field: ${key}.${nestedKey} = ${obj[key][nestedKey]}`);
            if (obj[key][nestedKey]) return obj[key][nestedKey];
          }
        }
      }
    }
    
    return 'N/A';
  }

  // Add formatDate method to the component class
  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  }
} 