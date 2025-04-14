import { Routes } from '@angular/router';
import { PoliceLayoutComponent } from './layout/police-layout.component';
import { PoliceDashboardComponent } from './dashboard/police-dashboard.component';
import { AssignedComplaintsComponent } from './assign/assigned-complaints.component';

export const POLICE_ROUTES: Routes = [
  {
    path: '',
    component: PoliceLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: PoliceDashboardComponent
      },
      {
        path: 'assign',
        component: AssignedComplaintsComponent
      },
      {
        path: 'my-cases',
        loadComponent: () => import('./cases/my-cases.component').then(c => c.MyCasesComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/police-reports.component').then(c => c.PoliceReportsComponent)
      }
    ]
  }
]; 