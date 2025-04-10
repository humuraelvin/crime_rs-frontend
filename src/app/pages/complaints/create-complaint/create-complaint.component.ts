import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <a routerLink="/complaints" class="text-blue-600 hover:text-blue-800">← Back to Complaints</a>
        </div>
        
        <div class="bg-white shadow-md rounded-lg p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">Create New Complaint</h1>
          
          <form (ngSubmit)="onSubmit()" #complaintForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Personal Information -->
              <div>
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="fullName" [(ngModel)]="complaintData.fullName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input type="tel" name="contact" [(ngModel)]="complaintData.contact"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" [(ngModel)]="complaintData.email"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                  </div>
                </div>
              </div>
              
              <!-- Incident Details -->
              <div>
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Incident Details</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Incident Date</label>
                    <input type="date" name="incidentDate" [(ngModel)]="complaintData.incidentDate"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" name="location" [(ngModel)]="complaintData.location"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Incident Type</label>
                    <select name="type" [(ngModel)]="complaintData.type"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                      <option value="">Select Type</option>
                      <option value="theft">Theft</option>
                      <option value="assault">Assault</option>
                      <option value="vandalism">Vandalism</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Description -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">Description</h3>
              <textarea name="description" [(ngModel)]="complaintData.description" rows="4"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required></textarea>
            </div>
            
            <!-- Evidence Upload -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">Evidence & Attachments</h3>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input type="file" class="sr-only" multiple>
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>
            
            <!-- Submit Button -->
            <div class="flex justify-end">
              <button type="submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CreateComplaintComponent {
  complaintData = {
    fullName: '',
    contact: '',
    email: '',
    incidentDate: '',
    location: '',
    type: '',
    description: ''
  };

  onSubmit() {
    console.log('Submitting complaint:', this.complaintData);
    // Add actual submission logic here
  }
} 