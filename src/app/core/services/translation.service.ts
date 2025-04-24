import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = `${environment.apiUrl}/languages`;
  private supportedLanguages = ['en', 'fr', 'rw'];
  private currentLang = 'en';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeTranslation();
  }

  private initializeTranslation(): void {
    // Get stored language from localStorage or use browser language
    let storedLang = 'en';
    
    if (this.isBrowser) {
      storedLang = localStorage.getItem('preferredLanguage') || '';
    }
    
    const browserLang = this.translate.getBrowserLang();
    
    // Set default language
    this.currentLang = storedLang || 
                     (browserLang && this.supportedLanguages.includes(browserLang) ? browserLang : 'en');
    
    // Set as default
    this.translate.setDefaultLang('en');
    this.translate.use(this.currentLang);
    
    if (this.isBrowser) {
      localStorage.setItem('preferredLanguage', this.currentLang);
    }
  }

  /**
   * Change the current language
   */
  changeLanguage(lang: string): void {
    if (this.supportedLanguages.includes(lang)) {
      this.currentLang = lang;
      this.translate.use(lang);
      
      if (this.isBrowser) {
        localStorage.setItem('preferredLanguage', lang);
      }
    }
  }

  /**
   * Get the current language
   */
  getCurrentLanguage(): string {
    return this.currentLang;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): Observable<any> {
    // Always use hard-coded languages instead of API call
    // This avoids potential 403 errors
    return of({
      'en': 'English',
      'fr': 'French',
      'rw': 'Kinyarwanda'
    });
  }

  /**
   * Load translations 
   * Always uses local translation files now to avoid auth issues
   */
  loadTranslations(lang: string): Observable<any> {
    // Return empty object - TranslateModule will automatically load translations from assets/i18n/*.json
    return of({});
  }
} 