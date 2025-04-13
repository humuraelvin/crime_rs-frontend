import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">User Management</h1>
      <p>This section will allow administrators to manage system users.</p>
    </div>
  `
})
export class UserManagementComponent {} 