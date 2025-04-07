import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../core/services/complaint.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

interface Complaint {
  id: number;
  type: string;
  description: string;
  location: string;
  status: 'pending' | 'under_investigation' | 'resolved';
  createdAt: string;
  updatedAt: string;
  reporterId: number;
  assignedOfficerId?: number;
  priority: 'low' | 'medium' | 'high';
  evidence?: string[];
  comments?: Comment[];
}

interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
}

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css']
})
export class ComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  selectedComplaint: Complaint | null = null;
  isPoliceOfficer = false;
  isAdmin = false;
  loading = false;
  error: string | null = null;
  filters = {
    status: '',
    type: '',
    priority: '',
    dateRange: {
      start: '',
      end: ''
    }
  };

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadComplaints();
  }

  private checkUserRole(): void {
    this.isPoliceOfficer = this.authService.hasRole('POLICE_OFFICER');
    this.isAdmin = this.authService.hasRole('ADMIN');
  }

  loadComplaints(): void {
    this.loading = true;
    this.complaintService.getComplaints(this.filters).subscribe({
      next: (complaints) => {
        this.complaints = complaints;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load complaints';
        this.loading = false;
        this.toastr.error('Failed to load complaints');
      }
    });
  }

  onFilterChange(): void {
    this.loadComplaints();
  }

  onComplaintSelect(complaint: Complaint): void {
    this.selectedComplaint = complaint;
  }

  updateComplaintStatus(complaintId: number, status: string): void {
    this.complaintService.updateComplaintStatus(complaintId, status).subscribe({
      next: () => {
        this.toastr.success('Complaint status updated successfully');
        this.loadComplaints();
      },
      error: (error) => {
        this.toastr.error('Failed to update complaint status');
      }
    });
  }

  assignOfficer(complaintId: number, officerId: number): void {
    this.complaintService.assignOfficer(complaintId, officerId).subscribe({
      next: () => {
        this.toastr.success('Officer assigned successfully');
        this.loadComplaints();
      },
      error: (error) => {
        this.toastr.error('Failed to assign officer');
      }
    });
  }

  addComment(complaintId: number, content: string): void {
    this.complaintService.addComment(complaintId, content).subscribe({
      next: () => {
        this.toastr.success('Comment added successfully');
        this.loadComplaints();
      },
      error: (error) => {
        this.toastr.error('Failed to add comment');
      }
    });
  }

  uploadEvidence(complaintId: number, file: File): void {
    this.complaintService.uploadEvidence(complaintId, file).subscribe({
      next: () => {
        this.toastr.success('Evidence uploaded successfully');
        this.loadComplaints();
      },
      error: (error) => {
        this.toastr.error('Failed to upload evidence');
      }
    });
  }
} 