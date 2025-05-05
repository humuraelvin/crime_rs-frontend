import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './core/components/nav/nav.component';
import { TranslationService } from './core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './core/services/auth.service';
import { AuthTokenService } from './core/services/auth-token.service';
import { isPlatformBrowser } from '@angular/common';
import { TitleService } from './core/services/title.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <div class="app-container">
      <app-nav></app-nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      background-color: #f9fafb;
    }
  `]
})
export class AppComponent implements OnInit {
  private isBrowser: boolean;

  constructor(
    private toastr: ToastrService,
    private translationService: TranslationService,
    private authService: AuthService,
    private authTokenService: AuthTokenService,
    private titleService: TitleService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Clear any existing toasts
    if (this.isBrowser) {
      this.toastr.clear();
    }
    
    // Load current language
    const currentLang = this.translationService.getCurrentLanguage();
    this.translationService.loadTranslations(currentLang).subscribe();
    
    // If user is logged in, refresh their profile silently
    if (this.isBrowser && this.authTokenService.isAuthenticated()) {
      this.authService.refreshUserProfile();
    }
    
    // Initialize title service to update page titles
    this.titleService.init();
  }
}
