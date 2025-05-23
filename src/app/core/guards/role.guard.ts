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
    
    if (!this.authService.isAuthenticated()) {
      console.log('Role Guard: User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Get current user and required roles
    const user = this.authService.currentUserValue;
    const requiredRoles = route.data['roles'] as string[];
    
    // Make sure user is not null
    if (!user) {
      console.log('Role Guard: User is null even though authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Allow police officers to access police routes
    if (state.url.startsWith('/police') && user.role === UserRole.POLICE_OFFICER) {
      return true;
    }

    // If we're already in the admin area and user is admin, allow access
    if (state.url.startsWith('/admin') && user.role === UserRole.ADMIN) {
      return true;
    }

    // Special case for citizen trying to access admin routes
    if (state.url.startsWith('/admin') && user.role === UserRole.CITIZEN) {
      console.log('Role Guard: Citizen attempting to access admin route, redirecting to dashboard');
      this.toastr.error('You do not have permission to access this area');
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Special case for police officer trying to access admin routes
    if (state.url.startsWith('/admin') && user.role === UserRole.POLICE_OFFICER) {
      console.log('Role Guard: Police officer attempting to access admin route, redirecting to police dashboard');
      this.toastr.error('You do not have permission to access the admin area. Redirecting to police dashboard.');
      this.router.navigate(['/police/dashboard']);
      return false;
    }

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles
    if (requiredRoles.includes(user.role)) {
      return true;
    } else {
      console.log(`Role Guard: User role ${user.role} does not match required roles: ${requiredRoles.join(', ')}`);
      
      // Redirect based on role
      if (user.role === UserRole.ADMIN) {
        console.log('Role Guard: Redirecting admin to admin dashboard');
        this.router.navigate(['/admin']);
      } else if (user.role === UserRole.POLICE_OFFICER) {
        console.log('Role Guard: Redirecting officer to police dashboard');
        this.router.navigate(['/police/dashboard']);
      } else {
        console.log('Role Guard: Redirecting citizen to citizen dashboard');
        this.router.navigate(['/dashboard']);
      }
      this.toastr.error('You do not have permission to access this area');
      return false;
    }
  }
} 