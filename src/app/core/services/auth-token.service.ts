import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service responsible for JWT token handling.
 * This is extracted from AuthService to break circular dependencies.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Get the stored access token
   */
  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get full authorization header with Bearer prefix
   */
  getAuthorizationHeader(): string {
    const token = this.getToken();
    return token ? `Bearer ${token}` : '';
  }

  /**
   * Check if the user is authenticated (has a valid token)
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('Token has expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  /**
   * Log details about the current token including any role information
   */
  logTokenDetails(): void {
    if (!this.isBrowser) {
      console.log('Not running in browser');
      return;
    }
    
    const token = this.getToken();
    if (!token) {
      console.log('No token available');
      return;
    }
    
    try {
      const decodedToken: any = jwtDecode(token);
      console.log('Token subject (email):', decodedToken.sub);
      console.log('Token expiration:', new Date(decodedToken.exp * 1000).toLocaleString());
      console.log('Token issued at:', new Date(decodedToken.iat * 1000).toLocaleString());
      
      // Look for roles - Spring Security typically includes authorities or scope
      if (decodedToken.authorities) {
        console.log('Authorities:', decodedToken.authorities);
      } else if (decodedToken.roles) {
        console.log('Roles:', decodedToken.roles);
      } else if (decodedToken.scope) {
        console.log('Scope:', decodedToken.scope);
      } else {
        console.log('No explicit role/authority information in token');
        console.log('Full token payload:', decodedToken);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  /**
   * Get the cached user data from local storage
   */
  getCachedUserData(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }
} 