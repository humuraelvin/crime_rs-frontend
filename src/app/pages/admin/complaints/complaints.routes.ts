import { Routes } from '@angular/router';
import { ComplaintAssignmentComponent } from './complaint-assignment/complaint-assignment.component';

export const ADMIN_COMPLAINT_ROUTES: Routes = [
  {
    path: '',
    component: ComplaintAssignmentComponent,
    title: 'Complaint Assignment'
  },
  {
    path: ':id',
    loadComponent: () => import('../../../pages/complaints/complaint-details/complaint-details.component').then(m => m.ComplaintDetailsComponent),
    title: 'Complaint Details'
  }
]; 