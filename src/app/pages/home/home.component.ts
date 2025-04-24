import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-white text-gray-800">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-4">{{ 'home.hero.title' | translate }}</h1>
          <p class="text-xl mb-6">{{ 'home.hero.subtitle' | translate }}</p>
          <span class="bg-white text-blue-900 px-6 py-3 rounded-full text-lg font-semibold shadow-lg">{{ 'home.hero.tagline' | translate }}</span>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">{{ 'home.features.title' | translate }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">{{ 'home.features.secureReporting.title' | translate }}</h3>
              <p>{{ 'home.features.secureReporting.description' | translate }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">{{ 'home.features.tracking.title' | translate }}</h3>
              <p>{{ 'home.features.tracking.description' | translate }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">{{ 'home.features.caseManagement.title' | translate }}</h3>
              <p>{{ 'home.features.caseManagement.description' | translate }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">{{ 'home.features.evidenceHandling.title' | translate }}</h3>
              <p>{{ 'home.features.evidenceHandling.description' | translate }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">{{ 'home.features.officerDashboard.title' | translate }}</h3>
              <p>{{ 'home.features.officerDashboard.description' | translate }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow">
              <h3 class="text-xl font-semibold mb-2 text-blue-800">{{ 'home.features.safetyPrivacy.title' | translate }}</h3>
              <p>{{ 'home.features.safetyPrivacy.description' | translate }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-20 bg-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-10">{{ 'home.howItWorks.title' | translate }}</h2>
          <div class="grid md:grid-cols-3 gap-10">
            <div>
              <div class="text-blue-700 text-5xl font-bold mb-2">1</div>
              <h3 class="text-xl font-semibold mb-1">{{ 'home.howItWorks.submit.title' | translate }}</h3>
              <p>{{ 'home.howItWorks.submit.description' | translate }}</p>
            </div>
            <div>
              <div class="text-blue-700 text-5xl font-bold mb-2">2</div>
              <h3 class="text-xl font-semibold mb-1">{{ 'home.howItWorks.track.title' | translate }}</h3>
              <p>{{ 'home.howItWorks.track.description' | translate }}</p>
            </div>
            <div>
              <div class="text-blue-700 text-5xl font-bold mb-2">3</div>
              <h3 class="text-xl font-semibold mb-1">{{ 'home.howItWorks.notify.title' | translate }}</h3>
              <p>{{ 'home.howItWorks.notify.description' | translate }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="bg-gray-100 py-20">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-10">{{ 'home.faq.title' | translate }}</h2>
          <div class="max-w-2xl mx-auto space-y-4">
            <div class="border rounded-lg">
              <button class="w-full text-left px-4 py-3 font-medium text-blue-800 hover:bg-gray-200 focus:outline-none" (click)="toggleFaq(0)">
                {{ 'home.faq.q1.question' | translate }}
              </button>
              <div *ngIf="faqOpen[0]" class="px-4 pb-4 text-gray-700">
                {{ 'home.faq.q1.answer' | translate }}
              </div>
            </div>
            <div class="border rounded-lg">
              <button class="w-full text-left px-4 py-3 font-medium text-blue-800 hover:bg-gray-200 focus:outline-none" (click)="toggleFaq(1)">
                {{ 'home.faq.q2.question' | translate }}
              </button>
              <div *ngIf="faqOpen[1]" class="px-4 pb-4 text-gray-700">
                {{ 'home.faq.q2.answer' | translate }}
              </div>
            </div>
            <div class="border rounded-lg">
              <button class="w-full text-left px-4 py-3 font-medium text-blue-800 hover:bg-gray-200 focus:outline-none" (click)="toggleFaq(2)">
                {{ 'home.faq.q3.question' | translate }}
              </button>
              <div *ngIf="faqOpen[2]" class="px-4 pb-4 text-gray-700">
                {{ 'home.faq.q3.answer' | translate }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Support Section -->
      <section class="bg-white py-16 text-center">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">{{ 'home.support.title' | translate }}</h2>
          <p class="text-gray-600">{{ 'home.support.description' | translate }} <a href="mailto:support@crimereporting.com" class="text-blue-700 font-semibold">{{ 'home.support.email' | translate }}</a></p>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-8">
        <div class="container mx-auto px-4 text-center">
          <p>{{ 'home.footer.copyright' | translate: { year: currentYear } }}</p>
          <p class="mt-2 text-gray-400">{{ 'home.footer.developedBy' | translate }} <span class="text-white font-semibold">{{ 'home.footer.developerName' | translate }}</span></p>
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
