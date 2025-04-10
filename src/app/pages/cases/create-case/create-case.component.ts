import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-case',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <a routerLink="/cases" class="text-blue-600 hover:text-blue-800">← Back to Cases</a>
        </div>
        
        <div class="bg-white shadow-md rounded-lg p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">Create New Case</h1>
          
          <form (ngSubmit)="onSubmit()" #caseForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Basic Information -->
              <div>
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Case Title</label>
                    <input type="text" name="title" [(ngModel)]="caseData.title"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" [(ngModel)]="caseData.category"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                      <option value="">Select Category</option>
                      <option value="theft">Theft</option>
                      <option value="assault">Assault</option>
                      <option value="vandalism">Vandalism</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Priority</label>
                    <select name="priority" [(ngModel)]="caseData.priority"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                      <option value="">Select Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- Assignment -->
              <div>
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Assignment</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Assigned Officer</label>
                    <select name="assignedOfficer" [(ngModel)]="caseData.assignedOfficer"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                      <option value="">Select Officer</option>
                      <option value="1">Officer Smith</option>
                      <option value="2">Officer Johnson</option>
                      <option value="3">Officer Brown</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Department</label>
                    <select name="department" [(ngModel)]="caseData.department"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required>
                      <option value="">Select Department</option>
                      <option value="investigation">Criminal Investigation</option>
                      <option value="cyber">Cyber Crime</option>
                      <option value="forensics">Forensics</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Related Complaints -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">Related Complaints</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Select Complaints</label>
                  <select name="relatedComplaints" [(ngModel)]="caseData.relatedComplaints" multiple
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="1">Complaint #1234</option>
                    <option value="2">Complaint #1235</option>
                    <option value="3">Complaint #1236</option>
                  </select>
                  <p class="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple complaints</p>
                </div>
              </div>
            </div>
            
            <!-- Description -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">Description</h3>
              <textarea name="description" [(ngModel)]="caseData.description" rows="4"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required></textarea>
            </div>
            
            <!-- Submit Button -->
            <div class="flex justify-end">
              <button type="submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Create Case
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CreateCaseComponent {
  caseData = {
    title: '',
    category: '',
    priority: '',
    assignedOfficer: '',
    department: '',
    relatedComplaints: [],
    description: ''
  };

  onSubmit() {
    console.log('Submitting case:', this.caseData);
    // Add actual submission logic here
  }
} 