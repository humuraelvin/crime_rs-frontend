import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { User, UserRole } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  mfaRequired: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  address?: string;
  role?: UserRole;
  enableMfa?: boolean;
}

export interface TwoFactorAuthSetupResponse {
  secretKey: string;
  qrCodeUrl: string;
}

export interface MfaVerificationRequest {
  email: string;
  mfaCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private refreshTokenTimeout: any;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private toastr: ToastrService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  public isAuthenticated(): boolean {
    try {
      const user = this.currentUserValue;
      if (!user || !user.accessToken) {
        console.log('Auth Service - No user or token found');
        return false;
      }

      // Validate token format before trying to parse
      if (!this.isValidJwtFormat(user.accessToken)) {
        console.log('Auth Service - Invalid token format');
        this.handleInvalidToken();
        return false;
      }

      try {
        const tokenData = this.parseJwt(user.accessToken);
        if (!tokenData || !tokenData.exp) {
          console.log('Auth Service - Invalid token data (no exp field)');
          this.handleInvalidToken();
          return false;
        }

        const expiryTime = new Date(tokenData.exp * 1000);
        const now = new Date();
        
        // Log the token expiration details
        const timeToExpiry = expiryTime.getTime() - now.getTime();
        const minutesToExpiry = Math.floor(timeToExpiry / 60000);
        console.log(`Auth Service - Token expires in ${minutesToExpiry} minutes (${new Date(tokenData.exp * 1000).toLocaleTimeString()})`);
        
        // If token is expired
        if (expiryTime <= now) {
          console.log('Auth Service - Token is expired');
          this.handleInvalidToken();
          return false;
        }
        
        // If token is about to expire within 1 minute, try to refresh it
        if (timeToExpiry < 60000) {
          // Try to refresh the token
          console.log('Auth Service - Token is about to expire, attempting refresh');
          this.refreshToken().subscribe({
            next: () => {
              console.log('Auth Service - Token refreshed successfully');
              return true;
            },
            error: (error) => {
              console.error('Auth Service - Token refresh failed:', error);
              this.handleInvalidToken();
              return false;
            }
          });
        }
        
        return true;
      } catch (e) {
        console.error('Auth Service - Error parsing token:', e);
        this.handleInvalidToken();
        return false;
      }
    } catch (e) {
      console.error('Auth Service - Error in isAuthenticated:', e);
      return false;
    }
  }

  public getAuthorizationHeader(): string | null {
    try {
      const user = this.currentUserValue;
      if (!user || !user.accessToken) {
        return null;
      }
      
      // Ensure token is in valid JWT format before returning
      if (!this.isValidJwtFormat(user.accessToken)) {
        console.log('Auth Service - Invalid token format in getAuthorizationHeader');
        return null;
      }
      
      return `Bearer ${user.accessToken}`;
    } catch (e) {
      console.error('Auth Service - Error in getAuthorizationHeader:', e);
      return null;
    }
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        localStorage.removeItem('currentUser');
        return null;
      }
    }
    return null;
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    console.log('Login request:', { email: loginRequest.email, passwordProvided: !!loginRequest.password, mfaCodeProvided: !!loginRequest.mfaCode });
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        map(response => {
          console.log('Login response:', { 
            success: true, 
            userId: response.userId,
            role: response.role,
            mfaEnabled: response.mfaEnabled,
            mfaRequired: response.mfaRequired,
            tokenProvided: !!response.accessToken 
          });
          
          // Only store user and set currentUser if we have tokens (not requiring MFA)
          if (response.accessToken) {
            const user: User = {
              id: response.userId,
              firstName: response.firstName,
              lastName: response.lastName,
              email: response.email,
              role: response.role,
              emailNotifications: false,
              smsNotifications: false,
              mfaEnabled: response.mfaEnabled,
              createdAt: new Date(),
              updatedAt: new Date(),
              accessToken: response.accessToken,
              refreshToken: response.refreshToken
            };
            
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(user));
            }
            this.currentUserSubject.next(user);
            this.startRefreshTokenTimer();
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error details:', error);
          
          // Improve error reporting
          if (error.status === 403) {
            console.log('Access forbidden - might be a CORS issue or endpoint protection');
          } else if (error.status === 401) {
            console.log('Authentication failed - invalid credentials');
          } else if (error.status === 0) {
            console.log('Server connection error - network issue or CORS');
          }
          
          return throwError(() => error);
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, registerRequest)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }

  verifyTwoFactorAuth(request: MfaVerificationRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/verify-2fa`, request)
      .pipe(
        map(response => {
          if (response.accessToken) {
            const user: User = {
              id: response.userId,
              firstName: response.firstName,
              lastName: response.lastName,
              email: response.email,
              role: response.role,
              emailNotifications: false,
              smsNotifications: false,
              mfaEnabled: response.mfaEnabled,
              createdAt: new Date(),
              updatedAt: new Date(),
              accessToken: response.accessToken,
              refreshToken: response.refreshToken
            };
            
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(user));
            }
            this.currentUserSubject.next(user);
            this.startRefreshTokenTimer();
          }
          return response;
        }),
        catchError(error => {
          console.error('MFA verification error:', error);
          return throwError(() => new Error(error.error?.message || 'MFA verification failed'));
        })
      );
  }

  generateMfaSecret(email: string): Observable<TwoFactorAuthSetupResponse> {
    return this.http.get<TwoFactorAuthSetupResponse>(`${environment.apiUrl}/auth/mfa/generate?email=${email}`)
      .pipe(
        catchError(error => {
          console.error('MFA setup error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to generate MFA secret'));
        })
      );
  }

  enableMfa(email: string, mfaCode: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/mfa/enable`, { email, mfaCode })
      .pipe(
        tap(() => {
          // Update the current user with MFA enabled
          const user = this.currentUserValue;
          if (user && user.email === email) {
            const updatedUser = { ...user, mfaEnabled: true };
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
            this.currentUserSubject.next(updatedUser);
          }
        }),
        catchError(error => {
          console.error('Enable MFA error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to enable MFA'));
        })
      );
  }

  disableMfa(email: string, password: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/mfa/disable`, { email, password })
      .pipe(
        tap(() => {
          // Update the current user with MFA disabled
          const user = this.currentUserValue;
          if (user && user.email === email) {
            const updatedUser = { ...user, mfaEnabled: false };
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
            this.currentUserSubject.next(updatedUser);
          }
        }),
        catchError(error => {
          console.error('Disable MFA error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to disable MFA'));
        })
      );
  }

  logout(): void {
    const user = this.currentUserValue;
    
    // Always proceed with client-side logout regardless of server response
    const performClientLogout = () => {
      console.log('Completing client-side logout process');
      // Stop the token refresh timer
      this.stopRefreshTokenTimer();
      
      // Clear user data from localStorage
      if (this.isBrowser) {
        localStorage.removeItem('currentUser');
      }
      
      // Clear user from BehaviorSubject
      this.currentUserSubject.next(null);
      
      // Show success message
      if (this.isBrowser) {
        this.toastr.success('You have been successfully logged out');
      }
      
      // Navigate to login page
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    };
    
    if (user && user.accessToken) {
      // Call backend logout endpoint if user is logged in
      this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      }).subscribe({
        next: () => {
          console.log('Successfully logged out on the server');
          performClientLogout();
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Even if the server-side logout fails, proceed with client-side logout
          performClientLogout();
        }
      });
    } else {
      // If no user or token, just do client-side logout
      performClientLogout();
    }
  }

  private completeLogout(): void {
    console.log('This method is deprecated - using performClientLogout inside logout() instead');
  }

  refreshToken(): Observable<AuthResponse> {
    try {
      const user = this.currentUserValue;
      if (!user) {
        console.log('Auth Service - No user available for token refresh');
        return throwError(() => new Error('No user available'));
      }
      
      if (!user.refreshToken) {
        console.log('Auth Service - No refresh token available');
        this.handleInvalidToken();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken: user.refreshToken })
        .pipe(
          map(response => {
            if (!response.accessToken || !response.refreshToken) {
              throw new Error('Invalid response from refresh token endpoint');
            }
            
            const updatedUser: User = {
              ...user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken
            };
            
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
            this.currentUserSubject.next(updatedUser);
            this.startRefreshTokenTimer();
            return response;
          }),
          catchError(error => {
            console.error('Auth Service - Failed to refresh token:', error);
            // Don't call full logout as it may cause redirect loops
            // Just clear tokens and update the subject
            this.handleInvalidToken();
            return throwError(() => new Error('Failed to refresh token'));
          })
        );
    } catch (error) {
      console.error('Auth Service - Error in refreshToken:', error);
      this.handleInvalidToken();
      return throwError(() => new Error('Error during token refresh'));
    }
  }

  updateUserProfile(userData: any): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/auth/users/profile`, userData)
      .pipe(
        tap(updatedUser => {
          const user = { ...this.currentUserValue, ...updatedUser };
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to update profile'));
        })
      );
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const user = this.currentUserValue;
    if (!user) {
      return false;
    }
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserValue;
    if (!user) {
      return false;
    }
    return roles.includes(user.role);
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isPoliceOfficer(): boolean {
    return this.hasRole(UserRole.POLICE_OFFICER);
  }

  isCitizen(): boolean {
    return this.hasRole(UserRole.CITIZEN);
  }

  // Helper methods for token refresh
  private startRefreshTokenTimer(): void {
    const user = this.currentUserValue;
    if (!user || !user.accessToken) {
      return;
    }

    // Parse the JWT token to get expiration time
    const jwtToken = this.parseJwt(user.accessToken);
    if (!jwtToken || !jwtToken.exp) {
      return;
    }

    // Set a timeout to refresh the token 1 minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  private parseJwt(token: string): any {
    try {
      // Validate token format
      if (!this.isValidJwtFormat(token)) {
        return null;
      }
      
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        console.error('Auth Service - Token missing payload segment');
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      try {
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (decodingError) {
        console.error('Auth Service - Error decoding token payload:', decodingError);
        return null;
      }
    } catch (error) {
      console.error('Auth Service - Error parsing JWT:', error);
      return null;
    }
  }
  
  // Helper to validate JWT format (should have 3 segments separated by 2 periods)
  private isValidJwtFormat(token: string): boolean {
    if (!token) return false;
    
    // JWT tokens must have exactly two periods
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Auth Service - Invalid token format: expected 3 segments, found', parts.length);
      return false;
    }
    
    // Check if each segment has content
    if (!parts[0] || !parts[1] || !parts[2]) {
      console.error('Auth Service - Invalid token format: empty segment(s)');
      return false;
    }
    
    return true;
  }
  
  // Helper to handle invalid token (clear and reset state)
  private handleInvalidToken(): void {
    console.log('Auth Service - Handling invalid token, clearing state');
    // Clear only the token, not entire user data
    if (this.isBrowser && this.currentUserValue) {
      const user = {...this.currentUserValue};
      delete user.accessToken;
      delete user.refreshToken;
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Method to get the JWT token
  getToken(): string {
    const user = this.currentUserValue;
    return user?.accessToken || '';
  }
} 