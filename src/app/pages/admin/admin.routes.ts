import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DEPARTMENT_ROUTES } from './departments/departments.routes';
import { OFFICER_ROUTES } from './officers/officers.routes';
import { ADMIN_COMPLAINT_ROUTES } from './complaints/complaints.routes';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

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
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
        title: 'Admin Dashboard'
      },
      {
        path: 'departments',
        children: DEPARTMENT_ROUTES,
        title: 'Departments'
      },
      {
        path: 'officers',
        children: OFFICER_ROUTES,
        title: 'Police Officers'
      },
      {
        path: 'complaints',
        children: ADMIN_COMPLAINT_ROUTES,
        title: 'Complaint Management'
      },
      {
        path: 'users',
        component: ManageUsersComponent,
        title: 'User Management'
      },
      {
        path: 'settings',
        component: SystemSettingsComponent,
        title: 'System Settings'
      }
    ]
  }
];