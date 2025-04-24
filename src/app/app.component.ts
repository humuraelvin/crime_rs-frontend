import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './core/components/nav/nav.component';
import { TranslationService } from './core/services/translation.service';
import { ToastrService } from 'ngx-toastr';

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
  
  constructor(
    private translationService: TranslationService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Clear any existing toasts from previous sessions
    this.toastr.clear();
    
    // Load translations for the current language (using local files now)
    const currentLang = this.translationService.getCurrentLanguage();
    this.translationService.loadTranslations(currentLang).subscribe();
  }
}
