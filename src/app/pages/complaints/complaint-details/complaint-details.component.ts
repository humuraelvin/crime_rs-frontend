import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ComplaintService, ComplaintResponse, Comment } from '../../../core/services/complaint.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <a routerLink="/complaints" class="text-blue-600 hover:text-blue-800">← Back to Complaints</a>
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
                    'bg-yellow-100 text-yellow-800': complaint.status === 'PENDING',
                    'bg-blue-100 text-blue-800': complaint.status === 'UNDER_INVESTIGATION',
                    'bg-green-100 text-green-800': complaint.status === 'RESOLVED',
                    'bg-red-100 text-red-800': complaint.status === 'REJECTED'
                  }">
                  {{ formatStatus(complaint.status) }}
                </span>
                
                <!-- Status Update Dropdown for Admin/Police -->
                <div *ngIf="canManageComplaints()" class="relative inline-block">
                  <button 
                    (click)="toggleStatusDropdown()" 
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
              <p class="text-gray-600">Name: {{ complaint.userName }}</p>
              <p class="text-gray-600">User ID: {{ complaint.userId }}</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Incident Details</h3>
              <p class="text-gray-600">Location: {{ complaint.location }}</p>
              <p class="text-gray-600">Type: {{ complaint.crimeType }}</p>
              <p class="text-gray-600">Priority: {{ getPriorityLabel(complaint.priorityScore) }}</p>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p class="text-gray-600 whitespace-pre-line">
              {{ complaint.description }}
            </p>
          </div>
          
          <div *ngIf="hasEvidences()" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Evidence & Attachments</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div *ngFor="let evidence of complaint.evidences" class="border rounded-lg p-2">
                <div *ngIf="isImageFile(evidence.fileUrl)" class="mb-2">
                  <img [src]="evidence.fileUrl" alt="Evidence" class="w-full h-auto rounded">
                </div>
                <a [href]="evidence.fileUrl" target="_blank" class="text-sm text-blue-600 hover:text-blue-800">
                  {{ getFileName(evidence.fileUrl) }}
                </a>
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
  
  constructor(
    private route: ActivatedRoute,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
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
      next: (data) => {
        this.complaint = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load complaint details. ' + error.message;
        this.loading = false;
        this.toastr.error('Failed to load complaint details', 'Error');
      }
    });
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
  
  isImageFile(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  }
  
  getFileName(url: string): string {
    if (!url) return 'Attachment';
    const parts = url.split('/');
    return parts[parts.length - 1];
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
} 