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
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from the service
    const currentUser = this.authService.currentUserValue;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    
    // Clone the request and add auth header if the user is logged in and the request is to the API URL
    if (currentUser && currentUser.token && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          this.toastr.error('Your session has expired. Please log in again.');
        } else if (error.status === 403) {
          this.toastr.error('You do not have permission to perform this action');
        } else if (error.status === 404) {
          this.toastr.error('The requested resource was not found');
        } else if (error.status >= 500) {
          this.toastr.error('An unexpected error occurred. Please try again later.');
        }

        return throwError(() => error);
      })
    );
  }
} 