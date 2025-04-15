import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthMessageHandlerComponent } from '../../../shared/components/auth-message-handler/auth-message-handler.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthMessageHandlerComponent],
  template: `
    <app-auth-message-handler></app-auth-message-handler>
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="sidebar bg-white w-64 min-h-screen shadow-md hidden md:block">
        <div class="p-4 border-b">
          <h2 class="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
        </div>
        <nav class="mt-2">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <span class="material-icons mr-3">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/admin/complaints" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <span class="material-icons mr-3">report</span>
            Complaints
          </a>
          <a routerLink="/admin/officers" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <span class="material-icons mr-3">badge</span>
            Officers
          </a>
          <a routerLink="/admin/departments" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <span class="material-icons mr-3">business</span>
            Departments
          </a>
          <a routerLink="/admin/users" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <span class="material-icons mr-3">people</span>
            Users
          </a>
          <a routerLink="/admin/settings" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
            <span class="material-icons mr-3">settings</span>
            Settings
          </a>
        </nav>
      </div>

      <!-- Mobile sidebar -->
      <div class="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50 transition-opacity duration-300" 
           [class.hidden]="!isMobileSidebarOpen" 
           (click)="toggleMobileSidebar()">
        <div class="bg-white w-64 min-h-screen shadow-md" (click)="$event.stopPropagation()">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            <button (click)="toggleMobileSidebar()" class="text-gray-500 hover:text-gray-700">
              <span class="material-icons">close</span>
            </button>
          </div>
          <nav class="mt-2">
            <a routerLink="/admin/dashboard" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
              <span class="material-icons mr-3">dashboard</span>
              Dashboard
            </a>
            <a routerLink="/admin/complaints" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
              <span class="material-icons mr-3">report</span>
              Complaints
            </a>
            <a routerLink="/admin/officers" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
              <span class="material-icons mr-3">badge</span>
              Officers
            </a>
            <a routerLink="/admin/departments" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
              <span class="material-icons mr-3">business</span>
              Departments
            </a>
            <a routerLink="/admin/users" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
              <span class="material-icons mr-3">people</span>
              Users
            </a>
            <a routerLink="/admin/settings" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
              <span class="material-icons mr-3">settings</span>
              Settings
            </a>
          </nav>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <header class="bg-white shadow">
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center space-x-3">
              <button class="md:hidden text-gray-500 hover:text-gray-700" (click)="toggleMobileSidebar()">
                <span class="material-icons">menu</span>
              </button>
              <h1 class="text-xl font-semibold text-gray-800">Crime Reporting Admin</h1>
            </div>
            <div class="flex items-center space-x-4">
              
              <div class="relative">
                
              </div>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-auto p-6 bg-gray-100">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      transition: transform 0.3s ease-in-out;
    }
  `]
})
export class AdminLayoutComponent {
  isMobileSidebarOpen = false;
  isUserMenuOpen = false;

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
} 