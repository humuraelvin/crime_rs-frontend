import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintsComponent } from './complaints.component';
import { ComplaintsRoutingModule } from './complaints-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ComplaintListComponent } from './components/complaint-list/complaint-list.component';
import { ComplaintDetailsComponent } from './components/complaint-details/complaint-details.component';
import { ComplaintFormComponent } from './components/complaint-form/complaint-form.component';
import { ComplaintFilterComponent } from './components/complaint-filter/complaint-filter.component';

@NgModule({
  declarations: [
    ComplaintsComponent,
    ComplaintListComponent,
    ComplaintDetailsComponent,
    ComplaintFormComponent,
    ComplaintFilterComponent
  ],
  imports: [
    CommonModule,
    ComplaintsRoutingModule,
    SharedModule
  ]
})
export class ComplaintsModule { } 