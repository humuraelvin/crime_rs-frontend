import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Simple helper service for internationalization that avoids circular dependencies.
 * This version doesn't depend on TranslateService to break circular dependencies.
 */
@Injectable({
  providedIn: 'root'
})
export class I18nHelperService {
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Get a translated value synchronously. 
   * In this simplified version, it just returns the default value or the key.
   */
  getTranslation(key: string, defaultValue?: string): string {
    // Simple implementation that just returns the default value or key
    // This breaks the circular dependency
    return defaultValue || key;
  }

  /**
   * Get the current language code
   */
  getCurrentLang(): string {
    // Get language from localStorage if available, otherwise return 'en'
    if (this.isBrowser) {
      return localStorage.getItem('preferredLanguage') || 'en';
    }
    return 'en';
  }
} 