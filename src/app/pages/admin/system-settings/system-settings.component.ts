import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SystemSettingsService, SystemSettings } from '../../../core/services/system-settings.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
          
          <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">Email Notifications</label>
                <div class="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" formControlName="emailNotificationsEnabled" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                  <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">SMS Notifications</label>
                <div class="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" formControlName="smsNotificationsEnabled" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                  <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                <div class="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" formControlName="maintenanceMode" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                  <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">System Version</label>
                <input type="text" formControlName="systemVersion" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Max File Upload Size (MB)</label>
                <input type="number" formControlName="maxFileUploadSize" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Allowed File Types (comma-separated)</label>
                <input type="text" formControlName="allowedFileTypes" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
              </div>
              
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">Auto-assign Complaints</label>
                <div class="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" formControlName="autoAssignComplaints" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                  <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Default Priority Level</label>
                <select formControlName="defaultPriorityLevel" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Data Retention Period (days)</label>
                <input type="number" formControlName="retentionPeriodDays" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
              </div>
            </div>
            
            <div class="flex justify-end space-x-4">
              <button type="button" (click)="resetToDefaults()" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Reset to Defaults
              </button>
              <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toggle-checkbox:checked {
      right: 0;
      border-color: #3b82f6;
    }
    .toggle-checkbox:checked + .toggle-label {
      background-color: #3b82f6;
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private systemSettingsService: SystemSettingsService,
    private toastr: ToastrService
  ) {
    this.settingsForm = this.fb.group({
      emailNotificationsEnabled: [true],
      smsNotificationsEnabled: [true],
      maintenanceMode: [false],
      systemVersion: ['1.0.0'],
      maxFileUploadSize: [10],
      allowedFileTypes: ['jpg,png,pdf'],
      autoAssignComplaints: [true],
      defaultPriorityLevel: ['MEDIUM'],
      retentionPeriodDays: [90]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.systemSettingsService.getSettings().subscribe({
      next: (settings: SystemSettings) => {
        this.settingsForm.patchValue(settings);
      },
      error: (error: Error) => {
        this.toastr.error(error.message || 'Failed to load system settings');
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      const settings: SystemSettings = {
        ...this.settingsForm.value,
        allowedFileTypes: this.settingsForm.value.allowedFileTypes.split(',').map((type: string) => type.trim())
      };

      this.systemSettingsService.updateSettings(settings).subscribe({
        next: () => {
          this.toastr.success('System settings updated successfully');
        },
        error: (error: Error) => {
          this.toastr.error(error.message || 'Failed to update system settings');
        }
      });
    }
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      this.systemSettingsService.resetToDefaults().subscribe({
        next: (settings: SystemSettings) => {
          this.settingsForm.patchValue(settings);
          this.toastr.success('Settings reset to defaults successfully');
        },
        error: (error: Error) => {
          this.toastr.error(error.message || 'Failed to reset settings');
        }
      });
    }
  }
} 