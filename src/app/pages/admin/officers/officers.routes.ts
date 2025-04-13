import { Routes } from '@angular/router';
import { OfficerListComponent } from './officer-list/officer-list.component';
import { OfficerFormComponent } from './officer-form/officer-form.component';

export const OFFICER_ROUTES: Routes = [
  {
    path: '',
    component: OfficerListComponent
  },
  {
    path: 'create',
    component: OfficerFormComponent
  },
  {
    path: 'edit/:id',
    component: OfficerFormComponent
  }
]; 