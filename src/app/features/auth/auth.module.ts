import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LogoutComponent } from './logout/logout.component';
// Import other auth components as they are created
// import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
// import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    LogoutComponent,
    // ForgotPasswordComponent,
    // ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AuthRoutingModule
  ],
  exports: [
    LoginComponent,
    RegisterComponent,
    LogoutComponent,
    // ForgotPasswordComponent,
    // ResetPasswordComponent
  ]
})
export class AuthModule { } 