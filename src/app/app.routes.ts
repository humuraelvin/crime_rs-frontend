import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ADMIN_ROUTES } from './pages/admin/admin.routes';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'complaints',
    loadChildren: () => import('./pages/complaints/complaints.routes').then(m => m.COMPLAINTS_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'cases',
    loadChildren: () => import('./pages/cases/cases.routes').then(m => m.CASES_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['POLICE_OFFICER', 'ADMIN'] }
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'POLICE_OFFICER'] }
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
