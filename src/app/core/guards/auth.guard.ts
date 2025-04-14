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
      
      // If user is trying to access admin routes and has the right role, let RoleGuard handle it
      if (state.url.startsWith('/admin') && 
          (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.POLICE_OFFICER)) {
        return true;
      }
      
      // For other routes, check the required roles
      const requiredRoles = route.data['roles'] as string[];
      if (!requiredRoles.includes(currentUser.role)) {
        console.log('Auth Guard: User does not have required role, redirecting to appropriate dashboard');
        
        if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.POLICE_OFFICER) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        return false;
      }
    }

    return true;
  }
} 