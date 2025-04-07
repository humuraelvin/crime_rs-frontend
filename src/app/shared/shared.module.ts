import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [
    LoadingSpinnerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    LoadingSpinnerComponent
  ]
})
export class SharedModule { } 