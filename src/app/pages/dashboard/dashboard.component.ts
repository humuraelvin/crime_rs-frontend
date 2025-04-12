import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintService } from '../../core/services/complaint.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { UserRole } from '../../core/models/user.model';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 pb-12">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <!-- Loading indicator -->
        <div *ngIf="loading" class="flex justify-center items-center my-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <!-- Statistics Cards - Always shown -->
        <div *ngIf="!loading">
          <!-- Summary Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Total Complaints Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div class="p-6 bg-blue-600 text-white">
                <h3 class="text-xl font-semibold mb-1">Total Complaints</h3>
                <p class="text-4xl font-bold">{{stats.total || 0}}</p>
              </div>
              <div class="p-4 bg-blue-50">
                <p class="text-sm text-blue-800">All reported cases in the system</p>
              </div>
            </div>
            
            <!-- Active Cases Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div class="p-6 bg-amber-500 text-white">
                <h3 class="text-xl font-semibold mb-1">Active Cases</h3>
                <p class="text-4xl font-bold">{{stats.active || 0}}</p>
              </div>
              <div class="p-4 bg-amber-50">
                <p class="text-sm text-amber-800">Cases currently under investigation</p>
              </div>
            </div>
            
            <!-- Resolved Cases Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div class="p-6 bg-green-600 text-white">
                <h3 class="text-xl font-semibold mb-1">Resolved Cases</h3>
                <p class="text-4xl font-bold">{{stats.resolved || 0}}</p>
              </div>
              <div class="p-4 bg-green-50">
                <p class="text-sm text-green-800">Successfully resolved complaints</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Citizen View (below the statistics) -->
        <div *ngIf="!loading && isCitizen">
          <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Welcome to Crime Reporting System</h2>
            <p class="text-gray-600 mb-4">
              As a citizen, you can report crimes, view your submitted complaints, and track their status.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 mt-6">
              <a routerLink="/complaints" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
                View My Complaints
              </a>
              <a routerLink="/complaints/create" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center">
                Report New Crime
              </a>
            </div>
          </div>
        </div>
        
        <!-- Error View - Only shown if severe error and no data available -->
        <div *ngIf="!loading && error && stats.total === 0" class="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg shadow-md mb-8">
          <h3 class="text-xl font-semibold mb-2">Error Loading Data</h3>
          <p>{{error}}</p>
          <p class="mt-4">
            <a (click)="loadStatistics()" class="text-blue-600 underline cursor-pointer">Try again</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: {
    total: number;
    active: number;
    resolved: number;
    byStatus: Record<string, number>;
  } = {
    total: 0,
    active: 0,
    resolved: 0,
    byStatus: {}
  };
  
  loading = true;
  error: string | null = null;
  hasStatisticsAccess = false;
  isCitizen = false;
  userRole: string = 'Unknown';

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Check user roles
    this.hasStatisticsAccess = this.authService.hasAnyRole([UserRole.ADMIN, UserRole.POLICE_OFFICER]);
    this.isCitizen = this.authService.hasRole(UserRole.CITIZEN);
    
    // Get user role for debugging
    const user = this.authService.currentUserValue;
    if (user) {
      this.userRole = user.role;
      console.log('Current user role:', this.userRole);
    } else {
      console.warn('No user found in auth service');
    }
  }

  ngOnInit(): void {
    // Load real statistics from API
    this.loadStatistics();
  }
  
  loadStatistics(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Loading dashboard statistics from API...');
    
    // First try to get statistics - this might require special permissions
    this.complaintService.getComplaintStatistics()
      .pipe(
        catchError(error => {
          console.log('Statistics API failed with error:', error);
          
          // If we get a 403, fall back to counting complaints
          if (error.status === 403) {
            return this.getStatsFromComplaints();
          }
          
          // For other errors, rethrow
          throw error;
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Statistics data from API or computed from complaints:', data);
          
          // Check if data.byStatus exists and has entries
          if (data && data.byStatus) {
            // Store the original byStatus data
            this.stats.byStatus = data.byStatus;
            
            // Calculate derived statistics using real data
            this.stats = {
              ...this.stats,
              total: data.total || 0,
              active: (data.byStatus.PENDING || 0) + (data.byStatus.UNDER_INVESTIGATION || 0),
              resolved: data.byStatus.RESOLVED || 0
            };
            
            // If total is zero but we have byStatus data, calculate total from byStatus
            if (this.stats.total === 0 && Object.keys(this.stats.byStatus).length > 0) {
              this.stats.total = Object.values(this.stats.byStatus).reduce((sum, value) => sum + value, 0);
            }
          } else {
            // If no byStatus data, set all values to 0
            this.stats = {
              total: 0,
              active: 0,
              resolved: 0,
              byStatus: {}
            };
          }
          
          console.log('Final dashboard stats (real data):', this.stats);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading both statistics and complaint counts:', error);
          
          // On error, show error message and set stats to 0
          this.stats = {
            total: 0,
            active: 0,
            resolved: 0,
            byStatus: {}
          };
          
          // Show appropriate error message
          if (error.status === 403) {
            this.error = "You don't have permission to view any statistics.";
          } else {
            this.error = "Could not load statistics from the server.";
          }
          
          this.loading = false;
        }
      });
  }
  
  // Alternative method to get statistics by counting complaints
  private getStatsFromComplaints() {
    console.log('Falling back to counting complaints directly');
    
    return this.complaintService.getComplaints().pipe(
      map(complaints => {
        // Handle both paginated and non-paginated responses
        let complaintsList = complaints;
        
        // Check if response is paginated
        if (complaints && 'content' in complaints && Array.isArray(complaints.content)) {
          complaintsList = complaints.content;
        }
        
        // If we don't have an array, return empty array
        if (!Array.isArray(complaintsList)) {
          console.warn('Unexpected complaint data format:', complaints);
          return [];
        }
        
        console.log(`Got ${complaintsList.length} complaints for counting`);
        
        // Count by status
        const byStatus: Record<string, number> = {};
        let activeCount = 0;
        let resolvedCount = 0;
        
        complaintsList.forEach(complaint => {
          const status = complaint.status || 'UNKNOWN';
          
          // Increment count for this status
          byStatus[status] = (byStatus[status] || 0) + 1;
          
          // Count active and resolved
          if (status === 'PENDING' || status === 'UNDER_INVESTIGATION') {
            activeCount++;
          } else if (status === 'RESOLVED') {
            resolvedCount++;
          }
        });
        
        // Return in same format as statistics endpoint
        return {
          total: complaintsList.length,
          byStatus: byStatus,
          active: activeCount,
          resolved: resolvedCount
        };
      }),
      catchError(error => {
        console.error('Error getting complaints list:', error);
        // Return empty stats object
        return of({
          total: 0,
          byStatus: {},
          active: 0,
          resolved: 0
        });
      })
    );
  }
} 