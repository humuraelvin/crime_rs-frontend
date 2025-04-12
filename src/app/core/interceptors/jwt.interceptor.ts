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

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();
  console.log('JWT Interceptor - Is authenticated:', isAuthenticated);
  
  // Get authorization header from AuthService
  const authHeader = authService.getAuthorizationHeader();
  
  if (authHeader) {
    // Only log the first part of the token for security
    console.log('JWT Interceptor - Adding token to request for URL:', request.url);
    const tokenPreview = authHeader.split(' ')[1]?.substring(0, 10) + '...';
    console.log('JWT Interceptor - Token preview:', tokenPreview);
    
    // Create a clone of the request with our token
    const authReq = request.clone({
      setHeaders: {
        Authorization: authHeader
      }
    });
    
    return next(authReq);
  } else {
    console.log('JWT Interceptor - No valid token available for request to:', request.url);
    return next(request);
  }
}; 