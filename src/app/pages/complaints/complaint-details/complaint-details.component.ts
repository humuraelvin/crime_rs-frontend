import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <a routerLink="/complaints" class="text-blue-600 hover:text-blue-800">← Back to Complaints</a>
        </div>
        
        <div class="bg-white shadow-md rounded-lg p-6">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Complaint #1234</h1>
            <span class="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Complainant Details</h3>
              <p class="text-gray-600">Name: John Doe</p>
              <p class="text-gray-600">Contact: +1234567890</p>
              <p class="text-gray-600">Email: john&#64;example.com</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Incident Details</h3>
              <p class="text-gray-600">Date: March 15, 2024</p>
              <p class="text-gray-600">Location: 123 Main St</p>
              <p class="text-gray-600">Type: Theft</p>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p class="text-gray-600">
              Sample complaint description will appear here.
            </p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Evidence & Attachments</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Sample attachment -->
              <div class="border rounded-lg p-2">
                <p class="text-sm text-gray-600">document.pdf</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ComplaintDetailsComponent {} 