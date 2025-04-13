import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'settings',
    component: SystemSettingsComponent
  },
  {
    path: 'departments',
    loadChildren: () => import('./departments/departments.routes').then(m => m.DEPARTMENT_ROUTES)
  },
  {
    path: 'officers',
    loadChildren: () => import('./officers/officers.routes').then(m => m.OFFICER_ROUTES)
  },
  {
    path: 'complaints',
    loadChildren: () => import('./complaints/complaints.routes').then(m => m.ADMIN_COMPLAINT_ROUTES)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES)
  }
]; 