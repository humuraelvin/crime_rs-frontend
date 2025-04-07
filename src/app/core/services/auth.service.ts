import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private refreshTokenTimeout: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  private getUserFromStorage(): User | null {
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

  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        map(user => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.startRefreshTokenTimer();
          return user;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, registerRequest)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }

  logout(): void {
    // Stop the token refresh timer
    this.stopRefreshTokenTimer();

    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<User> {
    const user = this.currentUserValue;
    if (!user || !user.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<User>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken: user.refreshToken })
      .pipe(
        map(user => {
          // Update stored user and token
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.startRefreshTokenTimer();
          return user;
        }),
        catchError(error => {
          this.logout();
          return throwError(() => new Error('Failed to refresh token'));
        })
      );
  }

  updateUserProfile(userData: any): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/profile`, userData)
      .pipe(
        tap(updatedUser => {
          // Update stored user data
          const user = { ...this.currentUserValue, ...updatedUser };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to update profile'));
        })
      );
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
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

  // Social login methods
  loginWithGoogle(token: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/google`, { token })
      .pipe(
        map(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.startRefreshTokenTimer();
          return user;
        }),
        catchError(error => throwError(() => new Error('Google login failed')))
      );
  }

  loginWithFacebook(token: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/facebook`, { token })
      .pipe(
        map(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.startRefreshTokenTimer();
          return user;
        }),
        catchError(error => throwError(() => new Error('Facebook login failed')))
      );
  }
} 