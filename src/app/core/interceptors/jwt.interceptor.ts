import { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  // Get the current user from the auth service
  const currentUser = authService.currentUserValue;
  const isApiUrl = request.url.startsWith(environment.apiUrl);
  
  console.log('JWT Interceptor - Request URL:', request.url);
  console.log('JWT Interceptor - Is API URL:', isApiUrl);
  console.log('JWT Interceptor - Current User:', currentUser ? `Logged in as ${currentUser.email}` : 'Not logged in');
  console.log('JWT Interceptor - Has Token:', currentUser && currentUser.accessToken ? 'Yes' : 'No');
  
  // If the user is logged in and the request is to the API URL, add the JWT auth header
  if (currentUser && currentUser.accessToken && isApiUrl) {
    console.log('JWT Interceptor - Adding token to request');
    console.log('JWT Interceptor - Token snippet:', currentUser.accessToken.substring(0, 20) + '...');
    
    // Create a clone of the request with our token
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.accessToken}`
      }
    });
    
    // Log the modified request headers
    console.log('JWT Interceptor - Authorization header added');
    return next(authReq);
  } else {
    console.log('JWT Interceptor - No token added to request');
    return next(request);
  }
}; 