import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
            <p class="text-3xl font-bold text-blue-600">150</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Active Cases</h3>
            <p class="text-3xl font-bold text-green-600">25</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">New Complaints</h3>
            <p class="text-3xl font-bold text-yellow-600">12</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Police Officers</h3>
            <p class="text-3xl font-bold text-purple-600">45</p>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <a routerLink="/admin/users" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">User Management</h3>
            <p class="text-gray-600">Manage users, roles, and permissions</p>
          </a>
          <a routerLink="/admin/settings" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">System Settings</h3>
            <p class="text-gray-600">Configure system parameters and settings</p>
          </a>
          <a routerLink="/cases" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Case Management</h3>
            <p class="text-gray-600">View and manage all cases</p>
          </a>
        </div>
        
        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div class="space-y-4">
            <div class="border-b pb-4">
              <p class="text-sm text-gray-500">2 minutes ago</p>
              <p class="text-gray-800">New user registered: John Doe</p>
            </div>
            <div class="border-b pb-4">
              <p class="text-sm text-gray-500">15 minutes ago</p>
              <p class="text-gray-800">Case #1234 status updated to "In Progress"</p>
            </div>
            <div class="border-b pb-4">
              <p class="text-sm text-gray-500">1 hour ago</p>
              <p class="text-gray-800">New complaint filed: #5678</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent {} 