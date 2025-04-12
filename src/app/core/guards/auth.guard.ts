import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

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
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Check if the user is logged in and authenticated
    if (this.authService.isLoggedIn && this.authService.isAuthenticated()) {
      // Check if route has data.roles specified
      if (route.data && route.data['roles']) {
        // Check if user has the required role
        if (this.authService.hasRole(route.data['roles'])) {
          return true;
        } else {
          // User doesn't have the required role, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      // No specific roles required, allow access
      return true;
    }
    
    // Not logged in or invalid token, redirect to login page with return url
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
} 