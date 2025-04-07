import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 401) {
            // Auto logout if 401 Unauthorized or 403 Forbidden response returned from API
            this.authService.logout();
            this.router.navigate(['/auth/login'], { 
              queryParams: { returnUrl: this.router.url }
            });
            errorMessage = 'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.router.navigate(['/403']);
            errorMessage = 'You do not have permission to access this resource.';
          } else if (error.status === 404) {
            errorMessage = 'The requested resource was not found.';
          } else if (error.status === 500) {
            errorMessage = 'A server error occurred. Please try again later.';
          } else {
            errorMessage = error.error?.message || errorMessage;
          }
        }
        
        // Show error in toast notification
        this.toastr.error(errorMessage, 'Error', {
          timeOut: 5000
        });
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
} 