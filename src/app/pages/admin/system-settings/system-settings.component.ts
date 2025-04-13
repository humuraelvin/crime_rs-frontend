import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">System Settings</h1>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <p class="text-gray-600">System settings functionality will be implemented here.</p>
      </div>
    </div>
  `
})
export class SystemSettingsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
} 