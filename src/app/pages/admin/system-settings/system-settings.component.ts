import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- General Settings -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">General Settings</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                <input type="text" value="Crime Reporting System"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input type="email" value="support@example.com"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>UTC</option>
                  <option>UTC+1</option>
                  <option>UTC+2</option>
                  <option>UTC+3</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Notification Settings -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
            <div class="space-y-6">
              <div>
                <label class="flex items-center">
                  <input type="checkbox" checked
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <span class="ml-2 text-gray-700">Email Notifications</span>
                </label>
              </div>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" checked
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <span class="ml-2 text-gray-700">SMS Notifications</span>
                </label>
              </div>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" checked
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <span class="ml-2 text-gray-700">System Alerts</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Security Settings -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input type="number" value="30"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Strong (8+ chars, special chars required)</option>
                  <option>Medium (8+ chars)</option>
                  <option>Basic (6+ chars)</option>
                </select>
              </div>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" checked
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <span class="ml-2 text-gray-700">Two-Factor Authentication</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Backup Settings -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">Backup Settings</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                <input type="number" value="30"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" checked
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <span class="ml-2 text-gray-700">Auto-delete old backups</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Save Button -->
        <div class="mt-8 flex justify-end">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SystemSettingsComponent {} 