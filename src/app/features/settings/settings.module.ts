import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SettingsRoutingModule,
    SharedModule
  ]
})
export class SettingsModule { } 