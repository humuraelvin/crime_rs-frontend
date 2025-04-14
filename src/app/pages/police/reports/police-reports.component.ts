import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-police-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Police Reports</h1>
        
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">Reports Feature Coming Soon</h2>
          <p class="text-gray-600 mb-4">
            This feature is currently under development and will be available soon.
          </p>
          <p class="text-gray-600">
            You'll be able to generate reports, view crime statistics, and analyze patterns.
          </p>
          <a routerLink="/police/dashboard" class="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PoliceReportsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.toastr.info('Reports feature coming soon');
  }
} 