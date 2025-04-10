import { Routes } from '@angular/router';
import { CasesListComponent } from './cases-list/cases-list.component';
import { CaseDetailsComponent } from './case-details/case-details.component';
import { CreateCaseComponent } from './create-case/create-case.component';

export const CASES_ROUTES: Routes = [
  {
    path: '',
    component: CasesListComponent
  },
  {
    path: 'create',
    component: CreateCaseComponent
  },
  {
    path: ':id',
    component: CaseDetailsComponent
  }
]; 