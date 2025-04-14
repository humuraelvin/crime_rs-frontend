import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthMessageHandlerComponent } from '../../../shared/components/auth-message-handler/auth-message-handler.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-police-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthMessageHandlerComponent],
  template: `
    <app-auth-message-handler></app-auth-message-handler>
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="sidebar bg-indigo-800 w-64 min-h-screen shadow-md hidden md:block">
        <div class="p-4 border-b border-indigo-700">
          <h2 class="text-xl font-semibold text-white">Police Dashboard</h2>
        </div>
        <nav class="mt-2">
          <a routerLink="/police/dashboard" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
            <span class="material-icons mr-3">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/police/my-cases" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
            <span class="material-icons mr-3">folder</span>
            My Cases
          </a>
          <a routerLink="/police/assign" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
            <span class="material-icons mr-3">assignment</span>
            Assigned Complaints
          </a>
          <a routerLink="/police/reports" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
            <span class="material-icons mr-3">summarize</span>
            Reports
          </a>
        </nav>
      </div>

      <!-- Mobile sidebar -->
      <div class="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50 transition-opacity duration-300" 
           [class.hidden]="!isMobileSidebarOpen" 
           (click)="toggleMobileSidebar()">
        <div class="bg-indigo-800 w-64 min-h-screen shadow-md" (click)="$event.stopPropagation()">
          <div class="p-4 border-b border-indigo-700 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-white">Police Dashboard</h2>
            <button (click)="toggleMobileSidebar()" class="text-indigo-100 hover:text-white">
              <span class="material-icons">close</span>
            </button>
          </div>
          <nav class="mt-2">
            <a routerLink="/police/dashboard" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
              <span class="material-icons mr-3">dashboard</span>
              Dashboard
            </a>
            <a routerLink="/police/my-cases" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
              <span class="material-icons mr-3">folder</span>
              My Cases
            </a>
            <a routerLink="/police/assign" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
              <span class="material-icons mr-3">assignment</span>
              Assigned Complaints
            </a>
            <a routerLink="/police/reports" routerLinkActive="bg-indigo-700 text-white" class="flex items-center px-4 py-3 text-indigo-100 hover:bg-indigo-700 hover:text-white">
              <span class="material-icons mr-3">summarize</span>
              Reports
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
              <h1 class="text-xl font-semibold text-gray-800">Police Officer Portal</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button class="text-gray-500 hover:text-gray-700">
                <span class="material-icons">notifications</span>
              </button>
              <div class="relative">
                <button class="flex items-center space-x-2 text-gray-700" (click)="toggleUserMenu()">
                  <span class="material-icons bg-gray-200 rounded-full p-1">person</span>
                  <span>{{ officerName }}</span>
                  <span class="material-icons" [class.transform]="isUserMenuOpen" [class.rotate-180]="isUserMenuOpen">arrow_drop_down</span>
                </button>
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10" [class.hidden]="!isUserMenuOpen">
                  <a routerLink="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                  <a routerLink="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                  <a routerLink="/auth/logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
                </div>
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
export class PoliceLayoutComponent implements OnInit {
  isMobileSidebarOpen = false;
  isUserMenuOpen = false;
  officerName = 'Officer';

  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.officerName = user.firstName || 'Officer';
    }
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
} 