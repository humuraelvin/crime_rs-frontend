import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';
import { PoliceService, PoliceStats } from '../../../core/services/police.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-police-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Officer Dashboard</h1>
        <p class="text-gray-700 mb-8">Welcome back, Officer {{ officerName }}!</p>
        
        <div *ngIf="loading" class="flex justify-center">
          <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
        </div>
        
        <div *ngIf="!loading">
          <!-- Officer Info -->
          <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Your Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-3 bg-indigo-50 rounded">
                <p class="text-gray-500 text-sm">Badge Number</p>
                <p class="text-lg font-semibold">{{ stats.badgeNumber || 'Not assigned' }}</p>
              </div>
              <div class="p-3 bg-indigo-50 rounded">
                <p class="text-gray-500 text-sm">Department</p>
                <p class="text-lg font-semibold">{{ stats.departmentName || 'Not assigned' }}</p>
              </div>
              <div class="p-3 bg-indigo-50 rounded">
                <p class="text-gray-500 text-sm">Rank</p>
                <p class="text-lg font-semibold">{{ stats.rank || 'Not assigned' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center">
              <div class="p-3 bg-indigo-100 rounded-full mr-4">
                <span class="material-icons text-indigo-600">assignment</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Assigned Complaints</h3>
                <p class="text-3xl font-bold text-indigo-600">{{ stats.assignedComplaints }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ stats.pendingComplaints }} pending · {{ stats.resolvedComplaints }} resolved
                </p>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center">
              <div class="p-3 bg-green-100 rounded-full mr-4">
                <span class="material-icons text-green-600">work</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Active Cases</h3>
                <p class="text-3xl font-bold text-green-600">{{ stats.activeCases }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  Out of {{ stats.totalCases }} total cases
                </p>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md flex items-center">
              <div class="p-3 bg-blue-100 rounded-full mr-4">
                <span class="material-icons text-blue-600">check_circle</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Closed Cases</h3>
                <p class="text-3xl font-bold text-blue-600">{{ stats.closedCases }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  Successfully resolved cases
                </p>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <a routerLink="/police/assign" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-3">
                <span class="material-icons text-indigo-600 mr-2">list_alt</span>
                <h3 class="text-xl font-semibold text-gray-800">Assigned Complaints</h3>
              </div>
              <p class="text-gray-600">View and manage complaints assigned to you</p>
            </a>
            
            <a routerLink="/police/my-cases" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-3">
                <span class="material-icons text-green-600 mr-2">folder</span>
                <h3 class="text-xl font-semibold text-gray-800">My Cases</h3>
              </div>
              <p class="text-gray-600">Access and update your active investigation cases</p>
            </a>
          </div>
          
          <!-- Recent Activity -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Complaints</h2>
            
            <div *ngIf="stats.recentComplaints && stats.recentComplaints.length > 0; else noComplaints" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let complaint of stats.recentComplaints">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">#{{ complaint.id }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ complaint.category || complaint.crimeType || 'N/A' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-800': complaint.status === 'ASSIGNED' || complaint.status === 'PENDING',
                              'bg-green-100 text-green-800': complaint.status === 'RESOLVED',
                              'bg-blue-100 text-blue-800': complaint.status === 'INVESTIGATING',
                              'bg-red-100 text-red-800': complaint.status === 'REJECTED'
                            }">
                        {{ formatStatus(complaint.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ complaint.dateFiled || complaint.createdAt | date:'MMM d, yyyy, h:mm a' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <ng-template #noComplaints>
              <div class="text-center py-4">
                <p class="text-gray-500">No recent complaints assigned to you.</p>
                <a routerLink="/police/assign" class="mt-2 inline-block text-indigo-600 hover:text-indigo-800">View all complaints</a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PoliceDashboardComponent implements OnInit {
  loading = true;
  officerName = '';
  
  stats: PoliceStats = {
    assignedComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    badgeNumber: '',
    departmentName: '',
    rank: '',
    recentComplaints: []
  };

  constructor(
    private policeService: PoliceService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.officerName = user.firstName || 'Officer';
    }
    
    this.fetchPoliceStats();
  }

  fetchPoliceStats(): void {
    this.loading = true;
    
    this.policeService.getPoliceStats()
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch police stats:', error);
          this.toastr.error('Failed to load dashboard statistics', 'Error');
          this.loading = false;
          return of(this.stats);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.stats = response;
          }
          this.loading = false;
        }
      });
  }

  formatStatus(status: string): string {
    if (!status) return 'Unknown';
    
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
} 