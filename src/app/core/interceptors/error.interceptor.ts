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
      // Log all errors with clear details
      console.log('Error Interceptor - Error caught:', {
        status: error.status,
        url: request.url,
        message: error.message,
        error: error.error
      });
      
      // Check specific endpoints that shouldn't trigger logout on 403
      const isComplaintEndpoint = request.url.includes(`${environment.apiUrl}/complaints`);
      const isStatisticsEndpoint = request.url.includes(`${environment.apiUrl}/complaints/statistics`);
      const isPasswordResetEndpoint = request.url.includes(`${environment.apiUrl}/password/`);
      const isLanguageEndpoint = request.url.includes(`${environment.apiUrl}/languages`);
      
      // Handle errors based on status code and endpoint
      if (error.status === 401) {
        console.log('Error Interceptor - 401 Unauthorized error, logging out');
        // Don't log out if it's a password reset endpoint
        if (!isPasswordResetEndpoint) {
          authService.logout();
          router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: router.url, reason: 'session_expired' } 
          });
          toastr.error('Your session has expired. Please log in again.');
        }
      } else if (error.status === 403) {
        // Only force logout on 403 if it's not from specific protected endpoints
        // For statistics and other read-only endpoints, we'll handle 403 within the components
        if (!isComplaintEndpoint && !isStatisticsEndpoint && !isPasswordResetEndpoint && !isLanguageEndpoint) {
          console.log('Error Interceptor - 403 Forbidden error (requires logout), logging out');
          authService.logout();
          router.navigate(['/auth/login']);
          toastr.error('Your session has expired or you lack sufficient permissions.');
        } else {
          console.log('Error Interceptor - 403 Forbidden error (handled by component)');
          // Let the component handle this error
        }
      } else if (error.status === 404) {
        toastr.error('The requested resource was not found');
      } else if (error.status >= 500) {
        toastr.error('Server error occurred. Please try again later.');
      } else if (error.error instanceof ErrorEvent) {
        // Client-side error (network issues, etc.)
        toastr.error('Network error occurred. Please check your connection.');
      } else {
        // Handle any other errors
        const errorMessage = error.error?.message || 'An unknown error occurred';
        
        // Specific handling for department null error
        if (errorMessage.includes('null value in column "department"')) {
          toastr.error('Department selection issue. Please select a valid department and try again.');
          console.error('Department null error details:', error.error);
        } else {
          toastr.error(errorMessage);
        }
      }
      
      return throwError(() => error);
    })
  );
}; 