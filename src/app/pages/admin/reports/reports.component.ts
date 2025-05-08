import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div (click)="navigateToReportsDashboard()" class="bg-white p-6 rounded-lg shadow hover:shadow-md cursor-pointer">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Generate Reports</h2>
            <span class="material-icons text-blue-600">bar_chart</span>
          </div>
          <p class="text-gray-600">Generate detailed PDF reports of complaints, officer performance, and user activity.</p>
        </div>
        
       
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  constructor(private router: Router) {}
  
  ngOnInit(): void {}
  
  navigateToReportsDashboard(): void {
    this.router.navigate(['/admin/reports/dashboard']);
  }
} 