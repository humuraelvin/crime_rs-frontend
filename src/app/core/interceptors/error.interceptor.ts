import { HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error Interceptor - Error caught:', error);
      
      // For complaint endpoints, don't auto-logout on 403 errors
      const isComplaintEndpoint = error.url?.includes(`${environment.apiUrl}/complaints`);
      const shouldLogout = error.status === 401 || (error.status === 403 && !isComplaintEndpoint);
      
      if (shouldLogout) {
        // Auto logout if 401 response or 403 response not from complaints
        console.log('Error Interceptor - Auth error detected, logging out');
        authService.logout();
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: router.url, reason: 'session_expired' } 
        });
        toastr.error('Your session has expired. Please log in again.');
      }
      
      return throwError(() => error);
    })
  );
}; 