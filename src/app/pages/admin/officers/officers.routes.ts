import { Routes } from '@angular/router';
import { OfficerListComponent } from './officer-list/officer-list.component';
import { OfficerFormComponent } from './officer-form/officer-form.component';

export const OFFICER_ROUTES: Routes = [
  {
    path: '',
    component: OfficerListComponent,
    title: 'Police Officers'
  },
  {
    path: 'create',
    component: OfficerFormComponent,
    title: 'Add Officer'
  },
  {
    path: 'edit/:id',
    component: OfficerFormComponent,
    title: 'Edit Officer'
  }
]; 