import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReportService } from './report.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [ReportService]
})
export class ReportModule { } 