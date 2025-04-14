import { Routes } from '@angular/router';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentFormComponent } from './department-form/department-form.component';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    component: DepartmentListComponent,
    title: 'Departments'
  },
  {
    path: 'new',
    component: DepartmentFormComponent,
    title: 'Add Department'
  },
  {
    path: 'edit/:id',
    component: DepartmentFormComponent,
    title: 'Edit Department'
  }
]; 