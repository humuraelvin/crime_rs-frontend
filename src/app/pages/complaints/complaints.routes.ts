import { Routes } from '@angular/router';
import { ComplaintsListComponent } from './complaints-list/complaints-list.component';
import { ComplaintDetailsComponent } from './complaint-details/complaint-details.component';
import { CreateComplaintComponent } from './create-complaint/create-complaint.component';

export const COMPLAINTS_ROUTES: Routes = [
  {
    path: '',
    component: ComplaintsListComponent,
    title: 'My Complaints'
  },
  {
    path: 'create',
    component: CreateComplaintComponent,
    title: 'Report a Complaint'
  },
  {
    path: ':id/edit',
    component: CreateComplaintComponent,
    title: 'Edit Complaint'
  },
  {
    path: ':id',
    component: ComplaintDetailsComponent,
    title: 'Complaint Details'
  }
]; 