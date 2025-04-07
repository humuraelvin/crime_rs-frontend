import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

interface AdminMenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  menuItems: AdminMenuItem[] = [
    {
      title: 'Analytics',
      icon: 'fas fa-chart-bar',
      route: 'analytics'
    },
    {
      title: 'User Management',
      icon: 'fas fa-users',
      route: 'users'
    },
    {
      title: 'Role Management',
      icon: 'fas fa-user-shield',
      route: 'roles'
    },
    {
      title: 'System Settings',
      icon: 'fas fa-cog',
      route: 'settings'
    }
  ];

  activeMenuItem: string = 'analytics';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url.split('/').pop();
      this.activeMenuItem = currentRoute || 'analytics';
    });
  }

  onMenuItemClick(route: string): void {
    this.activeMenuItem = route;
    this.router.navigate([`/admin/${route}`]);
  }

  logout(): void {
    this.authService.logout();
    this.toastr.success('Logged out successfully');
    this.router.navigate(['/login']);
  }
} 