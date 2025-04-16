import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white text-gray-800">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-4">Crime Reporting System</h1>
          <p class="text-xl mb-6">Secure. Efficient. Transparent. Report incidents with confidence.</p>
          <span class="bg-white text-blue-900 px-6 py-3 rounded-full text-lg font-semibold shadow-lg">Empowering Communities, One Report at a Time</span>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">Secure Crime Reporting</h3>
              <p>Report incidents online while maintaining anonymity and safety.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">Real-Time Complaint Tracking</h3>
              <p>Track the status of your complaint using unique IDs with live updates.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">Case Management</h3>
              <p>Officers can manage investigations, assign tasks, and update progress.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">Evidence Handling</h3>
              <p>Digital storage of photos, documents, and files tied to each case securely.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">Officer Dashboard</h3>
              <p>Dedicated tools for law enforcement to manage reports and communication.</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">User Safety & Privacy</h3>
              <p>Top-tier protection of user identity and data through encrypted protocols.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-20 bg-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-10">How It Works</h2>
          <div class="grid md:grid-cols-3 gap-10">
            <div>
              <div class="text-blue-700 text-5xl font-bold mb-2">1</div>
              <h3 class="text-xl font-semibold mb-1">Submit a Report</h3>
              <p>Fill in details of the incident with or without personal information.</p>
            </div>
            <div>
              <div class="text-blue-700 text-5xl font-bold mb-2">2</div>
              <h3 class="text-xl font-semibold mb-1">Track Progress</h3>
              <p>Use the unique tracking ID to check your report's progress anytime.</p>
            </div>
            <div>
              <div class="text-blue-700 text-5xl font-bold mb-2">3</div>
              <h3 class="text-xl font-semibold mb-1">Get Notified</h3>
              <p>Receive timely updates on investigations and outcomes securely.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="bg-gray-100 py-20">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div class="max-w-2xl mx-auto space-y-4">
            <div class="border rounded-lg">
              <button class="w-full text-left px-4 py-3 font-medium text-blue-800 hover:bg-gray-200 focus:outline-none" (click)="toggleFaq(0)">
                What happens after I report a crime?
              </button>
              <div *ngIf="faqOpen[0]" class="px-4 pb-4 text-gray-700">
                Your report is received by law enforcement, and an investigation is initiated. You can track the progress using your complaint ID.
              </div>
            </div>
            <div class="border rounded-lg">
              <button class="w-full text-left px-4 py-3 font-medium text-blue-800 hover:bg-gray-200 focus:outline-none" (click)="toggleFaq(1)">
                Is my identity protected?
              </button>
              <div *ngIf="faqOpen[1]" class="px-4 pb-4 text-gray-700">
                Yes. All reports can be made anonymously. If contact is needed, encrypted communication methods are used.
              </div>
            </div>
            <div class="border rounded-lg">
              <button class="w-full text-left px-4 py-3 font-medium text-blue-800 hover:bg-gray-200 focus:outline-none" (click)="toggleFaq(2)">
                Can I report on someone else's behalf?
              </button>
              <div *ngIf="faqOpen[2]" class="px-4 pb-4 text-gray-700">
                Absolutely. The system allows third-party reporting to ensure no crime goes unnoticed.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Support Section -->
      <section class="bg-white py-16 text-center">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">Need Help?</h2>
          <p class="text-gray-600">Reach out to our team via email at</p>
          <a href="mailto:support@crimereporting.com" class="text-blue-700 font-semibold">support&#64;crimereporting.com</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-8">
        <div class="container mx-auto px-4 text-center">
          <p>&copy; {{ currentYear }} Crime Reporting System. All rights reserved.</p>
          <p class="mt-2 text-gray-400">Developed with ❤️ by <span class="text-white font-semibold">Elvin Humura</span></p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  currentYear: number = new Date().getFullYear();
  faqOpen: boolean[] = [false, false, false];

  toggleFaq(index: number) {
    this.faqOpen[index] = !this.faqOpen[index];
  }
}
