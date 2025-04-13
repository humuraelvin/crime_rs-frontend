import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Reports Dashboard</h1>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <p class="text-gray-600">Reports functionality coming soon.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ReportsDashboardComponent {
} 