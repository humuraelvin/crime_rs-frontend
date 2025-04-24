import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="relative inline-block text-left">
      <button 
        type="button" 
        class="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        (click)="toggleDropdown()"
      >
        {{ getCurrentLanguageName() }}
        <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div 
        *ngIf="isOpen" 
        class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
      >
        <div class="py-1">
          <a 
            *ngFor="let lang of availableLanguages | keyvalue" 
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            (click)="changeLanguage(lang.key)"
          >
            {{ lang.value }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LanguageSelectorComponent implements OnInit {
  isOpen = false;
  availableLanguages: { [key: string]: string } = {
    en: 'English',
    fr: 'Français',
    rw: 'Kinyarwanda'
  };

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.loadLanguages();
  }

  loadLanguages(): void {
    this.translationService.getSupportedLanguages().subscribe(
      languages => {
        this.availableLanguages = languages;
      }
    );
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  getCurrentLanguageName(): string {
    const currentLang = this.translationService.getCurrentLanguage();
    return this.availableLanguages[currentLang] || 'English';
  }

  changeLanguage(langCode: string): void {
    this.translationService.changeLanguage(langCode);
    this.isOpen = false;
  }
} 