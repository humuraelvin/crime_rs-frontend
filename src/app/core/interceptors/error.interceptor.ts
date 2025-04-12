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
      
      // Check if complaint endpoint
      const isComplaintEndpoint = request.url.includes(`${environment.apiUrl}/complaints`);
      
      // Handle errors based on status code
      if (error.status === 401) {
        console.log('Error Interceptor - 401 Unauthorized error, logging out');
        authService.logout();
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: router.url, reason: 'session_expired' } 
        });
        toastr.error('Your session has expired. Please log in again.');
      } else if (error.status === 403) {
        if (!isComplaintEndpoint) {
          // Only logout on 403 if not a complaint endpoint
          console.log('Error Interceptor - 403 Forbidden error (non-complaint), logging out');
          authService.logout();
          router.navigate(['/auth/login']);
        }
        toastr.error('You do not have permission to perform this action');
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
        toastr.error(errorMessage);
      }
      
      return throwError(() => error);
    })
  );
}; 