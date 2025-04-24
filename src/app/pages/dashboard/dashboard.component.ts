import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import {
  ComplaintService,
  ComplaintStatistics
} from '../../core/services/complaint.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-100 pb-12">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ 'dashboard.title' | translate }}</h1>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <!-- Error State - Only show if there's a real error, not auth related -->
        <div *ngIf="error && !error.includes('session') && !error.includes('log in')" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
          <button (click)="logout()" class="ml-4 underline">{{ 'actions.logout' | translate }}</button>
        </div>

        <!-- Citizen View -->
        <div *ngIf="!isLoading && !error" class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 class="text-xl font-bold text-gray-800 mb-4">{{ 'dashboard.welcomeHeader' | translate }}</h2>
          <p class="text-gray-600 mb-4">
            {{ 'dashboard.welcomeMessage' | translate }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 mt-6">
            <a routerLink="/complaints" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
              {{ 'dashboard.viewComplaints' | translate }}
            </a>
            <a routerLink="/complaints/create" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center">
              {{ 'dashboard.reportNewCrime' | translate }}
            </a>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div *ngIf="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.totalComplaints' | translate }}</h3>
            <p class="text-6xl font-bold text-blue-600 mt-10">{{ stats.totalComplaints }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.pending' | translate }}</h3>
            <p class="text-6xl font-bold text-yellow-600 mt-10">{{ stats.pendingComplaints }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.underInvestigation' | translate }}</h3>
            <p class="text-6xl font-bold text-purple-600 mt-10">{{ stats.underInvestigationComplaints }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.resolved' | translate }}</h3>
            <p class="text-6xl font-bold text-green-600 mt-10">{{ stats.resolvedComplaints }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.rejected' | translate }}</h3>
            <p class="text-6xl font-bold text-red-600 mt-10">{{ stats.rejectedComplaints }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.closed' | translate }}</h3>
            <p class="text-6xl font-bold text-gray-600 mt-10">{{ stats.closedComplaints }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.topCategory' | translate }}</h3>
            <p class="text-4xl font-bold text-indigo-600 mt-10">{{ getTopCategory() }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.highPriority' | translate }}</h3>
            <p class="text-6xl font-bold text-orange-600 mt-10">{{ stats.highPriorityComplaints }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md h-60">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ 'dashboard.stats.evidenceUploads' | translate }}</h3>
            <p class="text-6xl font-bold text-pink-600 mt-10">{{ stats.totalEvidenceUploads }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class DashboardComponent implements OnInit {
  stats: ComplaintStatistics = {
    totalComplaints: 0,
    pendingComplaints: 0,
    underInvestigationComplaints: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0,
    closedComplaints: 0,
    complaintsByCategory: {},
    highPriorityComplaints: 0,
    totalEvidenceUploads: 0
  };
  isLoading = true;
  error: string | null = null;
  isCitizen = false;
  isAdmin = false;
  isPoliceOfficer = false;

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Clear any lingering error messages
    this.toastr.clear();
    
    setTimeout(() => {
      try {
        const user = this.authService.currentUserValue;
        console.log('Dashboard - Current user:', user);

        if (!user) {
          // Don't show error banner for auth issues
          console.warn('Dashboard - No user found in auth service');
          this.router.navigate(['/auth/login']);
          return;
        } else if (user.role !== UserRole.CITIZEN) {
          // Only set the error if we're not redirecting
          console.warn('Dashboard - Invalid role:', user.role);
          if (user.role === UserRole.ADMIN || user.role === UserRole.POLICE_OFFICER) {
            window.location.href = '/admin';
            return;
          }
          this.error = 'Unauthorized access. This dashboard is for citizens only.';
        } else {
          this.isCitizen = this.authService.hasRole(UserRole.CITIZEN);
          this.isAdmin = this.authService.hasRole(UserRole.ADMIN);
          this.isPoliceOfficer = this.authService.hasRole(UserRole.POLICE_OFFICER);
          this.loadStatistics();
        }
      } catch (err) {
        console.error('Dashboard - Error initializing:', err);
        // Only show error if it's not auth related
        if (err instanceof Error && !err.message.toLowerCase().includes('auth') && 
            !err.message.toLowerCase().includes('token') && !err.message.toLowerCase().includes('session')) {
          this.error = 'An error occurred while loading the dashboard.';
        }
      } finally {
        this.isLoading = false;
      }
    }, 100);
  }

  loadStatistics(): void {
    const observable = this.isCitizen
      ? this.complaintService.getUserComplaintStatistics()
      : this.complaintService.getComplaintStatistics();

    observable.subscribe({
      next: (stats: ComplaintStatistics) => {
        this.stats = stats;
      },
      error: (error: unknown) => {
        console.error('Error loading statistics:', error);
        // Don't show toast for 403 errors
        if (!(error instanceof Error && error.message.includes('403'))) {
          this.toastr.error('Failed to load statistics');
        }
        this.stats = {
          totalComplaints: 0,
          pendingComplaints: 0,
          underInvestigationComplaints: 0,
          resolvedComplaints: 0,
          rejectedComplaints: 0,
          closedComplaints: 0,
          complaintsByCategory: {},
          highPriorityComplaints: 0,
          totalEvidenceUploads: 0
        };
      }
    });
  }

  getTopCategory(): string {
    const categories = this.stats.complaintsByCategory;
    if (!categories || Object.keys(categories).length === 0) return 'N/A';
    const entries: [string, number][] = Object.entries(categories);
    const top = entries.reduce((a: [string, number], b: [string, number]) => (b[1] > a[1] ? b : a));
    return `${top[0]} (${top[1]})`;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}
