import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
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
  
  constructor() { }

  ngOnInit(): void {
    // Initialize any app-wide services or configurations
  }
}
