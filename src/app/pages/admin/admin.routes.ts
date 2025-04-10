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
  }
]; 