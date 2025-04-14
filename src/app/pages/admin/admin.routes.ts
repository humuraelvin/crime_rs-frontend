import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DEPARTMENT_ROUTES } from './departments/departments.routes';
import { OFFICER_ROUTES } from './officers/officers.routes';
import { ADMIN_COMPLAINT_ROUTES } from './complaints/complaints.routes';

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
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
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
      }
    ]
  }
];