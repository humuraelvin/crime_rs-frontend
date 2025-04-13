import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DEPARTMENT_ROUTES } from './departments/department.routes';
import { OFFICER_ROUTES } from './officers/officers.routes';
import { ADMIN_COMPLAINT_ROUTES } from './complaints/complaints.routes';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'departments',
        children: DEPARTMENT_ROUTES
      },
      {
        path: 'officers',
        children: OFFICER_ROUTES
      },
      {
        path: 'complaints',
        children: ADMIN_COMPLAINT_ROUTES
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  }
]; 