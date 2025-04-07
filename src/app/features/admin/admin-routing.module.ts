import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { SystemSettingsComponent } from './components/system-settings/system-settings.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full'
      },
      {
        path: 'analytics',
        component: AnalyticsDashboardComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: 'roles',
        component: RoleManagementComponent
      },
      {
        path: 'settings',
        component: SystemSettingsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 