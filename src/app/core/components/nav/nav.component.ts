import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class NavComponent implements OnInit {
  user: any;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Crime Map', route: '/map', icon: 'map' },
    { label: 'Reports', route: '/complaints', icon: 'description' },
    { label: 'Report Crime', route: '/complaints/new', icon: 'add_circle', roles: [UserRole.CITIZEN] },
    { label: 'Admin Panel', route: '/admin', icon: 'admin_panel_settings', roles: [UserRole.ADMIN] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn;
  }

  hasRole(role: UserRole): boolean {
    return this.authService.hasRole(role);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  closeMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.closeMenus();
    this.router.navigate(['/auth/logout']);
  }

  canShowNavItem(item: NavItem): boolean {
    // If no roles specified, show to all authenticated users
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    
    // Check if user has any of the required roles
    return item.roles.some(role => this.hasRole(role));
  }
} 