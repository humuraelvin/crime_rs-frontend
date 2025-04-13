import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Reports</h1>
      <p>This section will contain system reports and statistics.</p>
    </div>
  `
})
export class ReportsComponent {} 