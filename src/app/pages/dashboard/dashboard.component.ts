import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintService } from '../../core/services/complaint.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Statistics Cards -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Total Complaints</h3>
            <p class="text-3xl font-bold text-blue-600">{{stats.total || 0}}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Active Cases</h3>
            <p class="text-3xl font-bold text-green-600">{{stats.active || 0}}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Resolved Cases</h3>
            <p class="text-3xl font-bold text-purple-600">{{stats.resolved || 0}}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  stats: {
    total: number;
    active: number;
    resolved: number;
  } = {
    total: 0,
    active: 0,
    resolved: 0
  };

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.complaintService.getComplaintStatistics().subscribe({
      next: (data) => {
        this.stats = {
          total: data.total || 0,
          active: (data.byStatus?.PENDING || 0) + (data.byStatus?.UNDER_INVESTIGATION || 0),
          resolved: data.byStatus?.RESOLVED || 0
        };
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.toastr.error('Failed to load dashboard statistics');
      }
    });
  }
} 