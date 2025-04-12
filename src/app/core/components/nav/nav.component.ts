import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class NavComponent implements OnInit, OnDestroy {
  user: any;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isBrowser: boolean;
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Crime Map', route: '/map', icon: 'map' },
    { label: 'Reports', route: '/complaints', icon: 'description' },
    { label: 'Report Crime', route: '/complaints/create', icon: 'add_circle', roles: [UserRole.CITIZEN] },
    { label: 'Admin Panel', route: '/admin', icon: 'admin_panel_settings', roles: [UserRole.ADMIN] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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

  toggleUserMenu(event?: Event): void {
    if (!this.isBrowser) return;
    
    if (event) {
      event.stopPropagation(); // Prevent event bubbling
    }
    
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isMobileMenuOpen = false;
      
      // Add click listener to close menu when clicking outside
      setTimeout(() => {
        document.addEventListener('click', this.closeMenuOnClickOutside);
      });
    } else {
      document.removeEventListener('click', this.closeMenuOnClickOutside);
    }
  }

  closeMenuOnClickOutside = (): void => {
    if (!this.isBrowser) return;
    
    this.isUserMenuOpen = false;
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  }

  closeMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
    
    if (this.isBrowser) {
      document.removeEventListener('click', this.closeMenuOnClickOutside);
    }
  }

  logout(): void {
    this.closeMenus();
    this.authService.logout();
  }

  canShowNavItem(item: NavItem): boolean {
    // If no roles specified, show to all authenticated users
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    
    // Check if user has any of the required roles
    return item.roles.some(role => this.hasRole(role));
  }
  
  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.removeEventListener('click', this.closeMenuOnClickOutside);
    }
  }
} 