import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { User, UserRole } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

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
    @Inject(PLATFORM_ID) platformId: Object
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
    const user = this.currentUserValue;
    if (!user || !user.accessToken) {
      return false;
    }

    try {
      const tokenData = this.parseJwt(user.accessToken);
      if (!tokenData || !tokenData.exp) {
        return false;
      }

      const expiryTime = new Date(tokenData.exp * 1000);
      const now = new Date();
      
      // If token is expired or expires in less than 1 minute
      if (expiryTime.getTime() - now.getTime() < 60000) {
        // Try to refresh the token
        this.refreshToken().subscribe({
          next: () => true,
          error: () => {
            this.logout();
            return false;
          }
        });
      }
      
      return true;
    } catch (e) {
      console.error('Error parsing token:', e);
      return false;
    }
  }

  public getAuthorizationHeader(): string | null {
    const user = this.currentUserValue;
    if (!user || !user.accessToken) {
      return null;
    }
    return `Bearer ${user.accessToken}`;
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
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        map(response => {
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
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
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
    
    if (user && user.accessToken) {
      // Call backend logout endpoint if user is logged in
      this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      }).subscribe({
        next: () => {},
        error: (error) => console.error('Logout error:', error)
      });
    }
    
    this.stopRefreshTokenTimer();
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const user = this.currentUserValue;
    if (!user || !user.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken: user.refreshToken })
      .pipe(
        map(response => {
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
          this.logout();
          return throwError(() => new Error('Failed to refresh token'));
        })
      );
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

  hasRole(role: UserRole): boolean {
    const user = this.currentUserValue;
    if (!user) {
      return false;
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
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }
} 