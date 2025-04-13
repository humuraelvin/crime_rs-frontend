import { Routes } from '@angular/router';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentFormComponent } from './department-form/department-form.component';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    component: DepartmentListComponent
  },
  {
    path: 'create',
    component: DepartmentFormComponent
  },
  {
    path: 'edit/:id',
    component: DepartmentFormComponent
  }
]; 