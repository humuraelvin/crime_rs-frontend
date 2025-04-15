import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ComplaintService, ComplaintResponse, Comment } from '../../../core/services/complaint.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <a [routerLink]="getBackLink()" class="text-blue-600 hover:text-blue-800">← Back to Complaints</a>
        </div>
        
        <app-loading-spinner *ngIf="loading"></app-loading-spinner>
        
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="!loading && !errorMessage && complaint" class="bg-white shadow-md rounded-lg p-6">
          <div class="mb-6 flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Complaint #{{ complaint.id }}</h1>
              <div class="flex items-center space-x-4">
                <span class="px-3 py-1 text-sm font-semibold rounded-full" 
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': isStatusPending(complaint.status),
                    'bg-blue-100 text-blue-800': isStatusInvestigating(complaint.status),
                    'bg-green-100 text-green-800': isStatusResolved(complaint.status),
                    'bg-red-100 text-red-800': isStatusRejected(complaint.status)
                  }">
                  {{ formatStatus(complaint.status) }}
                </span>
                
                <!-- Status Update Dropdown for Admin/Police -->
                <div *ngIf="canManageComplaints()" class="relative inline-block dropdown-container">
                  <button 
                    (click)="toggleStatusDropdown($event)" 
                    class="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 focus:outline-none"
                    type="button">
                    Update Status
                  </button>
                  <div 
                    *ngIf="showStatusDropdown" 
                    class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="menu-button" 
                    tabindex="-1">
                    <div class="py-1" role="none">
                      <a 
                        *ngFor="let status of availableStatuses" 
                        (click)="updateStatus(status)" 
                        class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer" 
                        role="menuitem" 
                        tabindex="-1">
                        {{ formatStatus(status) }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Filed on: {{ formatDate(complaint.dateFiled) }}</p>
              <p class="text-sm text-gray-500">Last updated: {{ formatDate(complaint.dateLastUpdated) }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Complainant Details</h3>
              <p class="text-gray-600"><span class="font-medium">Name:</span> {{ complaint.userName }}</p>
              <p class="text-gray-600"><span class="font-medium">User ID:</span> {{ complaint.userId }}</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Incident Details</h3>
              <p class="text-gray-600"><span class="font-medium">Location:</span> {{ complaint.location || 'N/A' }}</p>
              <p class="text-gray-600"><span class="font-medium">Description:</span> {{ complaint.crimeType || 'N/A' }}</p>
              <p class="text-gray-600"><span class="font-medium">Priority:</span> {{ getPriorityLabel(complaint.priorityScore) }}</p>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p class="text-gray-600 whitespace-pre-line">
              {{ complaint.description || 'No description provided.' }}
            </p>
          </div>
          
          <div *ngIf="hasEvidences()" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Evidence & Attachments</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let evidence of complaint.evidences" class="border rounded-lg overflow-hidden bg-gray-50">
                <div *ngIf="isImageFile(evidence.fileUrl)" class="relative p-2">
                  <div class="w-full h-64 flex items-center justify-center">
                    <img 
                      [src]="complaintService.getFileUrl(evidence.fileUrl)" 
                      [alt]="getFileName(evidence.fileUrl)"
                      class="max-w-full max-h-full object-contain border rounded"
                      (click)="openImageInNewTab(evidence.fileUrl)"
                      style="cursor: pointer;"
                      (error)="handleImageError($event)"
                    >
                  </div>
                </div>
                <div *ngIf="!isImageFile(evidence.fileUrl)" class="p-4 flex items-center justify-center">
                  <div class="text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-1 text-sm text-gray-500">{{getFileName(evidence.fileUrl)}}</p>
                  </div>
                </div>
                <div class="p-3 border-t bg-white">
                  <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                      <p class="font-medium">{{getFileType(evidence.fileUrl)}}</p>
                      <p class="text-xs">{{evidence.uploadedAt ? (evidence.uploadedAt | date:'medium') : 'N/A'}}</p>
                    </div>
                    <a 
                      [href]="complaintService.getFileUrl(evidence.fileUrl)" 
                      target="_blank" 
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      [download]="getFileName(evidence.fileUrl)"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="hasComments()" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Comments</h3>
            <div class="space-y-4">
              <div *ngFor="let comment of complaint.comments" class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between mb-2">
                  <span class="font-medium">{{ comment.authorName }}</span>
                  <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-gray-700">{{ comment.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- Add Comment Form -->
          <div class="mt-8 border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Add a Comment</h3>
            <div class="mb-4">
              <textarea 
                [(ngModel)]="newComment" 
                class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" 
                rows="3" 
                placeholder="Write your comment here..."></textarea>
            </div>
            <button 
              (click)="addComment()" 
              [disabled]="!newComment.trim() || updating" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!updating">Submit Comment</span>
              <span *ngIf="updating">Submitting...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Clickaway listener for dropdown */
    :host {
      display: block;
    }
    
    /* Image styles */
    img {
      display: block;
      margin: 0 auto;
      max-width: 100%;
    }
  `]
})
export class ComplaintDetailsComponent implements OnInit {
  complaint: ComplaintResponse | null = null;
  loading = true;
  updating = false;
  errorMessage = '';
  complaintId!: number;
  newComment = '';
  showStatusDropdown = false;
  availableStatuses = ['PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'REJECTED'];
  isAdminRoute = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public complaintService: ComplaintService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    // Check if we're on an admin route
    this.isAdminRoute = this.router.url.includes('/admin/');
    
    // Check if navigation state has fromPolice parameter
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      const state = navigation.extras.state as {fromPolice?: boolean};
      if (state && state.fromPolice) {
        localStorage.setItem('fromPoliceRoute', 'true');
      }
    }
    
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.complaintId = +idParam;
        this.loadComplaint();
      } else {
        this.errorMessage = 'Complaint ID is missing';
        this.loading = false;
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }
  
  // Clean up event listener on component destruction
  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }
  
  // Clickaway listener for dropdown
  onDocumentClick(event: MouseEvent): void {
    if (this.showStatusDropdown && !(event.target as HTMLElement).closest('.dropdown-container')) {
      this.showStatusDropdown = false;
    }
  }
  
  toggleStatusDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Prevent document click from immediately closing it
    }
    this.showStatusDropdown = !this.showStatusDropdown;
  }
  
  updateStatus(status: string): void {
    if (!this.complaint || this.complaint.status === status) {
      this.showStatusDropdown = false;
      return;
    }
    
    this.updating = true;
    this.complaintService.updateComplaintStatus(this.complaintId, status).subscribe({
      next: () => {
        this.toastr.success(`Complaint status updated to ${this.formatStatus(status)}`);
        this.loadComplaint(); // Reload to get the updated complaint
        this.showStatusDropdown = false;
        this.updating = false;
      },
      error: (error) => {
        this.toastr.error(`Failed to update status: ${error.message || 'Unknown error'}`);
        this.updating = false;
        this.showStatusDropdown = false;
      }
    });
  }
  
  // Check if user has admin or police role to manage complaints
  canManageComplaints(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN, UserRole.POLICE_OFFICER]);
  }
  
  // Helper methods 
  hasComments(): boolean {
    return !!this.complaint && !!this.complaint.comments && this.complaint.comments.length > 0;
  }
  
  hasEvidences(): boolean {
    return !!this.complaint && !!this.complaint.evidences && this.complaint.evidences.length > 0;
  }
  
  loadComplaint(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.complaintService.getComplaintById(this.complaintId).subscribe({
      next: (data: any) => {
        console.log('Raw complaint data:', data);
        
        // Handle evidences specifically
        if (data.evidences === null) {
          data.evidences = [];
        }
        
        if (data.evidenceFileNames && Array.isArray(data.evidenceFileNames) && data.evidenceFileNames.length > 0) {
          // If we have file names but no evidences array, create one
          if (!data.evidences) {
            data.evidences = [];
          }
          
          // Add any missing evidence files
          data.evidenceFileNames.forEach((fileName: string) => {
            if (!data.evidences.find((e: any) => e.fileUrl === fileName)) {
              data.evidences.push({
                fileUrl: fileName,
                fileType: this.getFileType(fileName),
                uploadedAt: data.updatedAt || data.createdAt
              });
            }
          });
        }
        
        this.complaint = this.mapComplaintData(data);
        console.log('Processed complaint:', this.complaint);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load complaint details. ' + error.message;
        this.loading = false;
        this.toastr.error('Failed to load complaint details', 'Error');
      }
    });
  }
  
  // Helper method to map complaint data and handle all possible field names
  private mapComplaintData(rawData: any): ComplaintResponse {
    if (!rawData) return {} as ComplaintResponse;
    
    // Extract TYPE from all possible field names
    const typeValue = this.extractTypeField(rawData);
    console.log('Extracted TYPE value:', typeValue);
    
    return {
      ...rawData,
      // Ensure these fields are properly mapped
      crimeType: typeValue,
      dateFiled: rawData.dateFiled || rawData.createdAt || rawData.createTime || rawData.created_at || new Date().toISOString(),
      dateLastUpdated: rawData.dateLastUpdated || rawData.updatedAt || rawData.updateTime || rawData.updated_at || new Date().toISOString(),
      // Ensure other required fields have defaults
      location: rawData.location || 'N/A',
      category: rawData.category || 'N/A',
      status: rawData.status || 'PENDING',
      description: rawData.description || 'No description provided.',
      evidences: rawData.evidences || [],
      comments: rawData.comments || []
    };
  }
  
  // Helper to extract type value from all possible field names
  private extractTypeField(data: any): string {
    // Log the FULL object in raw JSON format
    console.log('Raw complaint JSON:', JSON.stringify(data, null, 2));
    
    // Look for exact key with "type" in it
    console.log('Object keys:', Object.keys(data));
    
    // Convert to regular object to access dynamically
    const obj = { ...data };
    
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
    
    // Try all possible field names for type
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
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatStatus(status: string): string {
    if (!status) return 'Unknown';
    
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  getPriorityLabel(score: number): string {
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  }
  
  getFullImageUrl(url: string): string {
    return this.complaintService.getFileUrl(url);
  }
  
  getFileName(url: string): string {
    if (!url) return 'Attachment';
    
    // Remove any URL parameters
    url = url.split('?')[0];
    
    // Handle both path formats:
    // 1. /uploads/filename.jpg
    // 2. http://domain.com/path/filename.jpg
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
  
  getFileType(url: string): string {
    const extension = this.getFileExtension(url).toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'JPEG Image';
      case 'png':
        return 'PNG Image';
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      default:
        return extension.toUpperCase() + ' File';
    }
  }
  
  getFileExtension(url: string): string {
    return url.split('.').pop() || '';
  }
  
  openImageInNewTab(url: string): void {
    // Clean the URL
    if (!url) return;
    
    console.log('Opening image in new tab:', url);
    
    // Use the blob approach to securely open image in new tab
    this.complaintService.getEvidenceFile(url).subscribe({
      next: (blob: Blob) => {
        // Create a blob URL
        const objectUrl = URL.createObjectURL(blob);
        
        // Open in new tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${this.getFileName(url)}</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh; 
                    background-color: #1a1a1a;
                  }
                  img { 
                    max-width: 100%; 
                    max-height: 90vh; 
                    object-fit: contain;
                  }
                </style>
              </head>
              <body>
                <img src="${objectUrl}" alt="${this.getFileName(url)}">
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          // Fallback if window.open is blocked
          window.location.href = objectUrl;
        }
      },
      error: (error) => {
        console.error('Failed to fetch image directly:', error);
        
        // Fallback to direct URL approach
        const directUrl = this.complaintService.getFileUrl(url);
        window.open(directUrl, '_blank');
        
        this.toastr.warning('Opening image directly in browser. You may need to log in again if prompted.');
      }
    });
  }
  
  isImageFile(url: string): boolean {
    const extension = this.getFileExtension(url).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  }
  
  addComment(): void {
    if (!this.newComment.trim() || !this.complaintId) return;
    
    this.updating = true;
    
    this.complaintService.addComment(this.complaintId, this.newComment).subscribe({
      next: () => {
        this.toastr.success('Comment added successfully');
        this.newComment = '';
        this.updating = false;
        // Reload the complaint to show the new comment
        this.loadComplaint();
      },
      error: (error) => {
        this.toastr.error('Failed to add comment: ' + error.message);
        this.updating = false;
      }
    });
  }
  
  getBackLink(): string {
    // For regular citizens, always return to complaints list
    if (this.authService.hasRole(UserRole.CITIZEN)) {
      return '/complaints';
    }
    
    // For police officers
    if (this.authService.hasRole(UserRole.POLICE_OFFICER)) {
      // Check if we came from assign page
      const fromPolice = localStorage.getItem('fromPoliceRoute') === 'true';
      if (fromPolice) {
        // Clear the flag after using it
        localStorage.removeItem('fromPoliceRoute');
        return '/police/assign';
      }
      // Default police route
      return '/police/dashboard';
    }
    
    // For admin users
    if (this.authService.hasRole(UserRole.ADMIN)) {
      return '/admin/complaints';
    }
    
    // Default fallback
    return '/complaints';
  }
  
  isStatusPending(status: string): boolean {
    return status === 'PENDING' || status === 'ASSIGNED' || status === 'PENDING_EVIDENCE';
  }
  
  isStatusInvestigating(status: string): boolean {
    return status === 'UNDER_INVESTIGATION' || status === 'INVESTIGATING' || status === 'UNDER_REVIEW';
  }
  
  isStatusResolved(status: string): boolean {
    return status === 'RESOLVED' || status === 'CLOSED';
  }
  
  isStatusRejected(status: string): boolean {
    return status === 'REJECTED';
  }
  
  // Add a method to handle image loading errors
  handleImageError(event: any): void {
    console.error('Image failed to load:', event.target.src);
    // Set a fallback image or error message
    event.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAADk0lEQVR4nO3cW4hNURzH8d+aGTKXQSNFHpTkUiZKKQ9K5JaUt1GeUPKgPCgPGikvlGukPEzuRSk8oEQeuFVELnMrGsYYY2aYy/Jgn2lP55w5Z87e6+y91vp+ajrTWfvf3/+33n322muvDYiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiEpCnoAsYwG8BKAAsA1AFoBFAPoAnAYwCPALwOqL6cMQXAadgBmDH+rgM4BaAxhdqyTg2ASwC+I36nD/X3F4DLAKYnWXA2mQfgDZLr+MHbvQUwN6nik+S8MRV5gfQ7fbDfACxLpBcS4rQxFXmD/+/4wd4CUIp/VQ0A7sNvx7T5BGA/gMp4uyQ+TQC+Il0bANwDUBZjv8SmDsAzJNMZAwOwE8ACAHUAKgFMBTANwAYAxxGeDvkMYGVMfROLEgB7EXxntAAogV03lsHugP1jtL+VzG7KbiH4DolqBTJfH95E9EHyLNh5jRG3EVxHRLUVmSveMKwZpKZnSP/c5HkK7cdqOuxE7PswQfCnR2j7FMCMQdpeAPDLcz1fPbfnzEoAJ5G58cVg9iFcnTHgEILtmPMRarG1eazHejRu2oBQdsoJj7XMilBPEzzVkrOmw87QgjyPGO4x7MMa7HqrJHnsdPUCdkI10iCb0Eb7UfYxPABwBkCrwzoGcwR2kt7joa2cVQv/h6uvAK7CHtT1eWzXhy0e2sp57fA7wU2rpqS4qilp2eCTYKbVkGFVjitYiOAuvJ1LsL7YNSPzHRLlVkQ6jcnUPIZ/d2GfVQyLMSYn2yEzMnDUVvGP2RhXwW4a6LlDXiFzT+TMQ3AdcgTAZwTXIfnM+MMm/O2UDgTXGfnO+EMpgDtItmPuQpeuYhVkxwzVCa4GnBtQ/Lrv12DMQbQBab+nNkeBHaB2J9SGGHLRmJ6ifSZf53I3pjKsgZ80B7PvYB/TVnSNqUSwj0Ik+SpGjMkJtrYRPVP09gzTfl2Etg976KO8MA12JbCrDukC0AK7ttB177YC2GHsQNs/D32UF/bB7b3IVtgDVoHdYNTuqX/y1maExwy1EtAP2Bcv5JUJsOcVYxtc94zRVpWH/slrV+Cm4x0N0skq4OI8I+6pbyW8P1kDYArsm1aN+G9puwV2GboNbrbVEBERERERERERERERERERERERERERERERERHJCn8BN+RqF/zD1uwAAAAASUVORK5CYII=';
    event.target.alt = 'Image not available';
    this.toastr.warning('Image failed to load. It may be inaccessible or missing.', 'Warning');
  }
} 