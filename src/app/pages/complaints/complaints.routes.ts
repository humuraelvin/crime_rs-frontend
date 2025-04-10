import { Routes } from '@angular/router';
import { ComplaintsListComponent } from './complaints-list/complaints-list.component';
import { ComplaintDetailsComponent } from './complaint-details/complaint-details.component';
import { CreateComplaintComponent } from './create-complaint/create-complaint.component';

export const COMPLAINTS_ROUTES: Routes = [
  {
    path: '',
    component: ComplaintsListComponent
  },
  {
    path: 'create',
    component: CreateComplaintComponent
  },
  {
    path: ':id',
    component: ComplaintDetailsComponent
  }
]; 