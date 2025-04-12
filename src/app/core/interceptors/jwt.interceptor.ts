import { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const isApiUrl = request.url.startsWith(environment.apiUrl);
  
  // Skip if not an API URL
  if (!isApiUrl) {
    return next(request);
  }

  // Get authorization header from AuthService
  const authHeader = authService.getAuthorizationHeader();
  
  if (authHeader) {
    console.log('JWT Interceptor - Adding token to request');
    // Only log the first part of the token for security
    const tokenPreview = authHeader.split(' ')[1]?.substring(0, 10) + '...';
    console.log('JWT Interceptor - Token preview:', tokenPreview);
    
    // Create a clone of the request with our token
    const authReq = request.clone({
      setHeaders: {
        Authorization: authHeader
      }
    });
    
    console.log('JWT Interceptor - Request prepared with Authorization header');
    return next(authReq);
  } else {
    console.log('JWT Interceptor - No valid token available for request to:', request.url);
    return next(request);
  }
}; 