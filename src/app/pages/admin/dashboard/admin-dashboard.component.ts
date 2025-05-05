import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface AdminStats {
  totalUsers: number;
  citizenCount: number;
  policeOfficerCount: number;
  adminCount: number;
  totalComplaints: number;
  activeComplaints: number;
  resolvedComplaints: number;
  totalDepartments: number;
  activeCases: number;
  complaintsByStatus: { [key: string]: number };
  complaintsByDepartment: { [key: string]: number };
  complaintsByMonth: { [key: string]: number };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div *ngIf="loading" class="flex justify-center">
          <app-loading-spinner [size]="'lg'" [color]="'primary'"></app-loading-spinner>
        </div>

        <div *ngIf="!loading">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
              <p class="text-3xl font-bold text-blue-600">{{ stats.totalUsers }}</p>
              <div class="text-sm text-gray-500 mt-2">
                <span class="block">Citizens: {{ stats.citizenCount }}</span>
                <span class="block">Officers: {{ stats.policeOfficerCount }}</span>
                <span class="block">Admins: {{ stats.adminCount }}</span>
              </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Active Cases</h3>
              <p class="text-3xl font-bold text-green-600">{{ stats.activeCases }}</p>
              <p class="text-sm text-gray-500 mt-2">From {{ stats.totalComplaints }} total complaints</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Complaints from Citizens</h3>
              <p class="text-3xl font-bold text-yellow-600">{{ stats.activeComplaints }}</p>
              <p class="text-sm text-gray-500 mt-2">{{ stats.resolvedComplaints }} complaints resolved</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Departments</h3>
              <p class="text-3xl font-bold text-purple-600">{{ stats.totalDepartments }}</p>
              <p class="text-sm text-gray-500 mt-2">Managing {{ stats.policeOfficerCount }} officers</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <a routerLink="/admin/departments" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Department Management</h3>
              <p class="text-gray-600">Create, view and manage police departments</p>
            </a>
            <a routerLink="/admin/officers" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Officer Management</h3>
              <p class="text-gray-600">Create and manage police officers</p>
            </a>
            <a routerLink="/admin/complaints" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Complaint Management</h3>
              <p class="text-gray-600">Assign and track citizen complaints</p>
            </a>
            <a routerLink="/admin/users" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">User Management</h3>
              <p class="text-gray-600">Manage user accounts and permissions</p>
            </a>
            <a routerLink="/admin/settings" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">System Settings</h3>
              <p class="text-gray-600">Configure system parameters and settings</p>
            </a>
          </div>

          <!-- Complaint Statistics with Charts -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Complaint Statistics</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-medium text-gray-700 mb-4">By Status</h3>
                <div class="h-80">
                  <canvas id="statusChart"></canvas>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-700 mb-4">Recent Months</h3>
                <div class="h-80">
                  <canvas id="monthsChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  loading = true;
  statusChart: Chart | null = null;
  monthsChart: Chart | null = null;
  
  stats: AdminStats = {
    totalUsers: 0,
    citizenCount: 0,
    policeOfficerCount: 0,
    adminCount: 0,
    totalComplaints: 0,
    activeComplaints: 0,
    resolvedComplaints: 0,
    totalDepartments: 0,
    activeCases: 0,
    complaintsByStatus: {},
    complaintsByDepartment: {},
    complaintsByMonth: {}
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchAdminStats();
  }
  
  ngOnDestroy(): void {
    // Destroy charts to prevent memory leaks
    if (this.statusChart) this.statusChart.destroy();
    if (this.monthsChart) this.monthsChart.destroy();
  }

  fetchAdminStats(): void {
    this.loading = true;
    this.http.get<AdminStats>(`${environment.apiUrl}/admin/stats`)
      .subscribe({
        next: (response) => {
          this.stats = response;
          this.loading = false;
          // Initialize charts after data is loaded
          setTimeout(() => {
            this.createStatusChart();
            this.createMonthsChart();
          }, 0);
        },
        error: (error) => {
          console.error('Failed to fetch admin stats:', error);
          this.toastr.error('Failed to load dashboard statistics');
          // Set loading to false and use default values
          this.loading = false;
          // Initialize with example data for demonstration
          this.stats = {
            totalUsers: 42,
            citizenCount: 35,
            policeOfficerCount: 5,
            adminCount: 2,
            totalComplaints: 28,
            activeComplaints: 12,
            resolvedComplaints: 16,
            totalDepartments: 3,
            activeCases: 10,
            complaintsByStatus: {
              'SUBMITTED': 5,
              'UNDER_REVIEW': 7,
              'ASSIGNED': 8,
              'INVESTIGATING': 2,
              'RESOLVED': 6
            },
            complaintsByDepartment: {
              'Central': 10,
              'North': 8,
              'South': 10
            },
            complaintsByMonth: {
              'January': 3,
              'February': 5,
              'March': 8,
              'April': 12
            }
          };
          
          // Initialize charts with example data
          setTimeout(() => {
            this.createStatusChart();
            this.createMonthsChart();
          }, 0);
        }
      });
  }

  getStatusList(): string[] {
    return Object.keys(this.stats.complaintsByStatus).sort();
  }

  getRecentMonthsList(): string[] {
    return Object.keys(this.stats.complaintsByMonth)
      .sort((a, b) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(a) - months.indexOf(b);
      });
  }

  formatStatusLabel(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  }
  
  createStatusChart(): void {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Destroy previous chart if it exists
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    
    const statuses = this.getStatusList();
    const formattedLabels = statuses.map(status => this.formatStatusLabel(status));
    const data = statuses.map(status => this.stats.complaintsByStatus[status] || 0);
    
    // Define a color palette for the status chart
    const statusColors = [
      'rgba(54, 162, 235, 0.8)',   // blue - Submitted
      'rgba(255, 206, 86, 0.8)',    // yellow - Under Review
      'rgba(75, 192, 192, 0.8)',    // teal - Assigned
      'rgba(153, 102, 255, 0.8)',   // purple - Investigating
      'rgba(255, 99, 132, 0.8)',    // red - Rejected
      'rgba(255, 159, 64, 0.8)',    // orange - Pending Evidence
      'rgba(46, 204, 113, 0.8)',    // green - Resolved
      'rgba(149, 165, 166, 0.8)'    // gray - Closed
    ];
    
    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: formattedLabels,
        datasets: [{
          label: 'Complaints by Status',
          data: data,
          backgroundColor: statusColors.slice(0, data.length),
          borderColor: statusColors.slice(0, data.length).map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Count: ${context.formattedValue}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }
  
  createMonthsChart(): void {
    const ctx = document.getElementById('monthsChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Destroy previous chart if it exists
    if (this.monthsChart) {
      this.monthsChart.destroy();
    }
    
    const months = this.getRecentMonthsList();
    const data = months.map(month => this.stats.complaintsByMonth[month] || 0);
    
    this.monthsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Complaints by Month',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Count: ${context.formattedValue}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }
}
