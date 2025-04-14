import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('RoleGuard - Checking access to route:', state.url);
    console.log('RoleGuard - Required roles:', route.data['roles']);
    
    // First check if the user is authenticated
    if (!this.authService.isLoggedIn || !this.authService.isAuthenticated()) {
      console.log('RoleGuard - User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Always allow admin dashboard access for admin/police without role checks
    if (state.url.startsWith('/admin') && 
        (this.authService.currentUserValue?.role === UserRole.ADMIN || 
         this.authService.currentUserValue?.role === UserRole.POLICE_OFFICER)) {
      console.log('RoleGuard - Admin/Police accessing admin routes, allowing access');
      return true;
    }

    // Check if route has required roles data
    const requiredRoles = route.data['roles'] as Array<string>;
    console.log('RoleGuard - User role:', this.authService.currentUserValue?.role);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('RoleGuard - No specific roles required, allowing access');
      return true; // No specific roles required
    }

    // Convert string roles to UserRole enum values
    const userRoles = requiredRoles.map(role => UserRole[role as keyof typeof UserRole]);

    // Check if the user has any of the required roles
    if (this.authService.hasAnyRole(userRoles)) {
      console.log('RoleGuard - User has required role, allowing access');
      return true;
    }

    // User doesn't have the required role
    console.log('RoleGuard - Access denied, user lacks required role');
    this.toastr.error('You do not have permission to access this page', '', {
      timeOut: 3000,
      closeButton: true
    });
    
    // Redirect based on user role
    const currentUser = this.authService.currentUserValue;
    if (currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.POLICE_OFFICER)) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
    
    return false;
  }
} 