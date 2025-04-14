// Import necessary Angular modules
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Bootstrap the application using the module-based approach for JIT compilation
bootstrapApplication(AppComponent, appConfig)
  .catch((err: Error) => console.error(err));
