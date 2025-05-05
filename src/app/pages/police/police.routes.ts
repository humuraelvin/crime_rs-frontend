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
        component: PoliceDashboardComponent,
        title: 'Police Dashboard'
      },
      {
        path: 'assign',
        component: AssignedComplaintsComponent,
        title: 'Assigned Complaints'
      },
      {
        path: 'my-cases',
        loadComponent: () => import('./cases/my-cases.component').then(c => c.MyCasesComponent),
        title: 'My Cases'
      }
    ]
  }
]; 