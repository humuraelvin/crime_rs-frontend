import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

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
    // First check if the user is authenticated
    if (!this.authService.isLoggedIn) {
      this.toastr.error('You must be logged in to access this page');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Check if route has required roles data
    const requiredRoles = route.data['roles'] as Array<string>;
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific roles required
    }

    // Check if the user has any of the required roles
    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // User doesn't have the required role
    this.toastr.error('You do not have permission to access this page');
    this.router.navigate(['/dashboard']);
    return false;
  }
} 