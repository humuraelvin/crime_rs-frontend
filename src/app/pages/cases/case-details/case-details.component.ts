import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <a routerLink="/cases" class="text-blue-600 hover:text-blue-800">← Back to Cases</a>
        </div>
        
        <div class="bg-white shadow-md rounded-lg p-6">
          <div class="mb-6">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Case #5678</h1>
                <span class="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Update Status
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Case Information</h3>
              <div class="space-y-2">
                <p class="text-gray-600">Created: March 15, 2024</p>
                <p class="text-gray-600">Last Updated: March 16, 2024</p>
                <p class="text-gray-600">Priority: High</p>
                <p class="text-gray-600">Category: Theft</p>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Assignment</h3>
              <div class="space-y-2">
                <p class="text-gray-600">Assigned To: Officer Smith</p>
                <p class="text-gray-600">Department: Criminal Investigation</p>
                <p class="text-gray-600">Contact: +1234567890</p>
              </div>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p class="text-gray-600">
              Sample case description will appear here.
            </p>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Related Complaints</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <a href="#" class="text-blue-600 hover:text-blue-800">Complaint #1234</a>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Evidence & Documents</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Sample documents -->
              <div class="border rounded-lg p-2">
                <p class="text-sm text-gray-600">evidence1.pdf</p>
              </div>
              <div class="border rounded-lg p-2">
                <p class="text-sm text-gray-600">photo1.jpg</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Case Updates</h3>
            <div class="space-y-4">
              <!-- Sample update -->
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-500">March 16, 2024 - Officer Smith</p>
                <p class="text-gray-700 mt-1">Investigation in progress. Witness statements collected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CaseDetailsComponent {} 