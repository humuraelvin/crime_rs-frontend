import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Crime Reporting System</h1>
          <p class="text-xl text-gray-600">Report incidents and track cases efficiently</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a routerLink="/complaints/create" 
             class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Report a Crime</h2>
            <p class="text-gray-600">File a new complaint or report an incident</p>
          </a>
          
          <a routerLink="/complaints" 
             class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Track Complaints</h2>
            <p class="text-gray-600">View and track the status of your complaints</p>
          </a>
          
          <a routerLink="/cases" 
             class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Active Cases</h2>
            <p class="text-gray-600">View ongoing investigations and case updates</p>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {} 