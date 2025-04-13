import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">System Settings</h1>
      <p>This section will allow configuration of system settings.</p>
    </div>
  `
})
export class AdminSettingsComponent {} 