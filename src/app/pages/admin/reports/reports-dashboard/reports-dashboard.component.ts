import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../core/services/report.service';
import { ReportModule } from '../../../../core/services/report.module';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ReportModule],
  template: `
    <div class="bg-white shadow overflow-hidden rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">{{ 'reports.title' | translate }}</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ 'reports.description' | translate }}</p>
      </div>
      
      <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Date Range Selection -->
          <div class="col-span-1 sm:col-span-2">
            <h4 class="text-base font-medium text-gray-700 mb-2">{{ 'reports.date_range' | translate }}</h4>
            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div class="w-full sm:w-1/2">
                <label for="startDate" class="block text-sm font-medium text-gray-700">{{ 'reports.start_date' | translate }}</label>
                <input 
                  type="datetime-local" 
                  id="startDate" 
                  [(ngModel)]="startDate" 
                  class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>
              <div class="w-full sm:w-1/2">
                <label for="endDate" class="block text-sm font-medium text-gray-700">{{ 'reports.end_date' | translate }}</label>
                <input 
                  type="datetime-local" 
                  id="endDate" 
                  [(ngModel)]="endDate" 
                  class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>
            </div>
          </div>
          
          <!-- Report Cards -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-base font-medium text-gray-700 mb-2">{{ 'reports.complaints_report' | translate }}</h4>
            <p class="text-sm text-gray-500 mb-4">{{ 'reports.complaints_report_desc' | translate }}</p>
            
            <div class="mb-4">
              <label for="complaintStatus" class="block text-sm font-medium text-gray-700">{{ 'reports.status' | translate }}</label>
              <select 
                id="complaintStatus" 
                [(ngModel)]="complaintStatus" 
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">{{ 'reports.all_statuses' | translate }}</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="PENDING_EVIDENCE">PENDING_EVIDENCE</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            
            <div class="mb-4">
              <label for="crimeType" class="block text-sm font-medium text-gray-700">{{ 'reports.crime_type' | translate }}</label>
              <select 
                id="crimeType" 
                [(ngModel)]="crimeType" 
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">{{ 'reports.all_types' | translate }}</option>
                <option value="THEFT">THEFT</option>
                <option value="ASSAULT">ASSAULT</option>
                <option value="BURGLARY">BURGLARY</option>
                <option value="FRAUD">FRAUD</option>
                <option value="VANDALISM">VANDALISM</option>
                <option value="ROBBERY">ROBBERY</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            
            <button 
              (click)="generateComplaintsReport()" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              [disabled]="loading"
            >
              <span *ngIf="loading" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ 'reports.generate_pdf' | translate }}
            </button>
          </div>
          
          <div class="bg-indigo-50 p-4 rounded-lg col-span-1 sm:col-span-2">
            <h4 class="text-base font-bold text-indigo-800 mb-2">{{ 'reports.system_overview_report' | translate }}</h4>
            <p class="text-sm text-indigo-700 mb-4">{{ 'reports.system_overview_desc' | translate }}</p>
            
            <button 
              (click)="generateSystemOverviewReport()" 
              class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              [disabled]="loading"
            >
              <span *ngIf="loading" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ 'reports.generate_comprehensive_report' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  providers: [DatePipe]
})
export class ReportsDashboardComponent implements OnInit {
  startDate: string;
  endDate: string;
  complaintStatus: string = '';
  crimeType: string = '';
  loading: boolean = false;

  constructor(
    private reportService: ReportService,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.startDate = this.formatDateForInput(thirtyDaysAgo);
    this.endDate = this.formatDateForInput(today);
  }

  ngOnInit(): void {
    // Nothing to initialize
  }

  generateComplaintsReport(): void {
    this.loading = true;
    console.log('Generating complaints report with:', {
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.complaintStatus,
      crimeType: this.crimeType
    });
    
    this.reportService.downloadServerReport('complaints', {
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.complaintStatus,
      crimeType: this.crimeType
    }).subscribe({
      next: (success) => {
        this.loading = false;
        // toastr notification is now handled in the report service
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Failed to generate report: ' + (error.message || 'Unknown error'));
        console.error('Error generating complaints report', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  generateSystemOverviewReport(): void {
    this.loading = true;
    console.log('Generating system overview report with:', {
      startDate: this.startDate,
      endDate: this.endDate
    });
    
    this.reportService.downloadServerReport('system-overview', {
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe({
      next: (success) => {
        this.loading = false;
        // toastr notification is now handled in the report service
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Failed to generate report: ' + (error.message || 'Unknown error'));
        console.error('Error generating system overview report', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private formatDateForInput(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm') || '';
  }
} 