import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';

// Register locale data
registerLocaleData(localeEn, 'en');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
    // Provide locale for date formatting
    { provide: LOCALE_ID, useValue: 'en-US' },
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
        closeButton: true,
        enableHtml: true,
        maxOpened: 1,  // Only allow one toast at a time
        autoDismiss: true, // Auto-dismiss the duplicate toasts
        resetTimeoutOnDuplicate: true, // Reset the timeout if a duplicate toast is shown
      }),
      // Import the CoreModule and SharedModule to ensure their services are available
      CoreModule,
      SharedModule
    )
  ]
};
