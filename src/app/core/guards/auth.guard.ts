import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Allow access to auth routes without checking
    if (state.url.startsWith('/auth/')) {
      return true;
    }

    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      console.log('Auth Guard: User not logged in, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('Auth Guard: User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if route requires specific roles
    if (route.data && route.data['roles']) {
      const currentUser = this.authService.currentUserValue;
      
      // Make sure user is not null
      if (!currentUser) {
        console.log('Auth Guard: User is null even though authenticated, redirecting to login');
        this.router.navigate(['/auth/login']);
        return false;
      }
      
      // If police officer is accessing police routes, allow access
      if (state.url.startsWith('/police') && currentUser.role === UserRole.POLICE_OFFICER) {
        return true;
      }
      
      // If admin is trying to access admin routes, allow access
      if (state.url.startsWith('/admin') && currentUser.role === UserRole.ADMIN) {
        return true;
      }

      // Police officers should not access admin routes
      if (state.url.startsWith('/admin') && currentUser.role === UserRole.POLICE_OFFICER) {
        console.log('Auth Guard: Police officer attempting to access admin route, redirecting to police dashboard');
        this.toastr.error('You do not have permission to access the admin area');
        this.router.navigate(['/police/dashboard']);
        return false;
      }
      
      // For other routes, check the required roles
      const requiredRoles = route.data['roles'] as string[];
      if (!requiredRoles.includes(currentUser.role)) {
        console.log('Auth Guard: User does not have required role, redirecting to appropriate dashboard');
        
        if (currentUser.role === UserRole.ADMIN) {
          this.router.navigate(['/admin']);
        } else if (currentUser.role === UserRole.POLICE_OFFICER) {
          this.router.navigate(['/police/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        return false;
      }
    }

    return true;
  }
} 