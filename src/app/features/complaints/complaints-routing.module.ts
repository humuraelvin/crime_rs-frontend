import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComplaintsComponent } from './complaints.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: ComplaintsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ComplaintListComponent
      },
      {
        path: 'new',
        component: ComplaintFormComponent
      },
      {
        path: ':id',
        component: ComplaintDetailsComponent
      },
      {
        path: ':id/edit',
        component: ComplaintFormComponent,
        canActivate: [RoleGuard],
        data: { roles: ['POLICE_OFFICER', 'ADMIN'] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComplaintsRoutingModule { } 