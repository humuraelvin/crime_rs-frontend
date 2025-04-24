import { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isApiUrl = request.url.startsWith(environment.apiUrl);
  
  // Skip if not an API URL
  if (!isApiUrl) {
    return next(request);
  }

  // Skip authentication for auth endpoints
  if (request.url.includes('/auth/login') || 
      request.url.includes('/auth/register') || 
      request.url.includes('/auth/refresh-token') ||
      request.url.includes('/password/') ||
      request.url.includes('/languages')) {
    return next(request);
  }

  try {
    // Check if user is authenticated - safer method that handles exceptions
    const isAuthenticated = authService.isAuthenticated();
    console.log('JWT Interceptor - Is authenticated:', isAuthenticated);
    
    // Get authorization header from AuthService
    const authHeader = authService.getAuthorizationHeader();
    
    if (authHeader && authHeader.includes('Bearer ') && authHeader.split(' ')[1]?.length > 10) {
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
      console.log('JWT Interceptor - Invalid token format, skipping authentication for:', request.url);
      
      // For certain public endpoints, we'll let the request through without a token
      if (request.url.includes('/public/') || 
          request.url.includes('/api/v1/public/') || 
          request.url.includes('/languages')) {
        return next(request);
      }
      
      // For auth endpoints, let the request through without a token
      if (request.url.includes('/auth/')) {
        return next(request);
      }
      
      // Force logout and redirect to login if token is invalid on protected endpoints
      if (!request.url.includes('/complaints/statistics')) {
        // Don't force logout for statistics endpoint to prevent circular redirects
        authService.logout();
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: router.url, reason: 'invalid_token' } 
        });
      }
      
      // Still send the original request - the server will return 401/403 which will be handled by error interceptor
      return next(request);
    }
  } catch (error) {
    console.error('JWT Interceptor - Error handling authentication:', error);
    // Let the request continue without token - server will return 401/403
    return next(request);
  }
}; 