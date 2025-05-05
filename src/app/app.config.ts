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
import { TranslationModule } from './core/modules/translation.module';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Title } from '@angular/platform-browser';

// Required for JIT compilation
import '@angular/compiler';

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
    // Provide Title service for managing the document title
    Title,
    provideAnimations(),
    provideClientHydration(),
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 2000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
        closeButton: true,
        enableHtml: false,
        maxOpened: 1,
        autoDismiss: true,
        resetTimeoutOnDuplicate: false,
        tapToDismiss: true,
        newestOnTop: true,
        disableTimeOut: false,
        extendedTimeOut: 500,
        easing: 'linear',
        easeTime: 200
      }),
      // Import the CoreModule and SharedModule to ensure their services are available
      CoreModule,
      SharedModule,
      TranslationModule
    )
  ]
};
