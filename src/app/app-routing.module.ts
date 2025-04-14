import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LogoutComponent } from './core/components/logout/logout.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
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
  // Reports module is missing, commenting out temporarily
  // {
  //   path: 'reports',
  //   loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
  //   canActivate: [AuthGuard]
  // },
  // Map module is missing, commenting out temporarily
  // {
  //   path: 'map',
  //   loadChildren: () => import('./features/map/map.module').then(m => m.MapModule),
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(c => c.SettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 