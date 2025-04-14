import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">System Settings</h1>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Notification Settings</h2>
        <form [formGroup]="notificationForm" (ngSubmit)="saveNotificationSettings()">
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input 
                  id="emailNotifications" 
                  type="checkbox" 
                  formControlName="emailNotifications"
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="emailNotifications" class="font-medium text-gray-700">Email Notifications</label>
                <p class="text-gray-500">Enable system-wide email notifications</p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input 
                  id="smsNotifications" 
                  type="checkbox" 
                  formControlName="smsNotifications"
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="smsNotifications" class="font-medium text-gray-700">SMS Notifications</label>
                <p class="text-gray-500">Enable system-wide SMS notifications</p>
              </div>
            </div>
            
            <button 
              type="submit" 
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Notification Settings
            </button>
          </div>
        </form>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">System Maintenance</h2>
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="maintenanceMode" 
                type="checkbox" 
                [(ngModel)]="maintenanceMode"
                (change)="toggleMaintenanceMode()"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="maintenanceMode" class="font-medium text-gray-700">Maintenance Mode</label>
              <p class="text-gray-500">Put the system in maintenance mode to prevent user access during updates</p>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <h3 class="text-lg font-medium mb-2">System Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                (click)="clearSystemCache()"
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear System Cache
              </button>
              
              <button 
                (click)="rebuildSearchIndex()"
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Rebuild Search Index
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">System Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">System Version</p>
            <p class="text-base text-gray-900">1.0.0</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-gray-500">Last Updated</p>
            <p class="text-base text-gray-900">{{ lastUpdated | date:'medium' }}</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-gray-500">Database Status</p>
            <p class="text-base text-gray-900">Connected</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-gray-500">API Status</p>
            <p class="text-base text-gray-900">Operational</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SystemSettingsComponent implements OnInit {
  notificationForm: FormGroup;
  maintenanceMode = false;
  lastUpdated = new Date();

  constructor(private fb: FormBuilder) {
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false]
    });
  }

  ngOnInit(): void {
    // Here you would typically load settings from a service
  }

  saveNotificationSettings(): void {
    console.log('Notification settings saved:', this.notificationForm.value);
    // Here you would typically save settings via a service
    alert('Notification settings saved successfully!');
  }

  toggleMaintenanceMode(): void {
    console.log('Maintenance mode toggled:', this.maintenanceMode);
    // Here you would typically update maintenance mode via a service
    alert(`Maintenance mode ${this.maintenanceMode ? 'enabled' : 'disabled'}`);
  }

  clearSystemCache(): void {
    console.log('Clearing system cache...');
    // Here you would typically call a service method
    alert('System cache cleared successfully!');
  }

  rebuildSearchIndex(): void {
    console.log('Rebuilding search index...');
    // Here you would typically call a service method
    alert('Search index rebuilt successfully!');
  }
} 