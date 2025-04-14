import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 pb-12">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
          <button (click)="logout()" class="ml-4 underline">Logout</button>
        </div>
        
        <!-- Citizen View -->
        <div *ngIf="!isLoading && !error" class="bg-white p-6 rounded-lg shadow-md mb-8">
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
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Add a small delay to ensure auth state is properly initialized
    setTimeout(() => {
      try {
        const user = this.authService.currentUserValue;
        console.log('Dashboard - Current user:', user);
        
        if (!user) {
          this.error = 'No user found. Please log in again.';
          console.warn('Dashboard - No user found in auth service');
          this.router.navigate(['/auth/login']);
        } else if (user.role !== UserRole.CITIZEN) {
          this.error = 'Unauthorized access. This dashboard is for citizens only.';
          console.warn('Dashboard - Invalid role:', user.role);
          if (user.role === UserRole.ADMIN || user.role === UserRole.POLICE_OFFICER) {
            window.location.href = '/admin';
          }
        }
      } catch (err) {
        console.error('Dashboard - Error initializing:', err);
        this.error = 'An error occurred while loading the dashboard.';
      } finally {
        this.isLoading = false;
      }
    }, 100);
  }

  logout() {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
} 