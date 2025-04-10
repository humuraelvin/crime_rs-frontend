import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SetupMfaComponent } from './setup-mfa/setup-mfa.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'setup-mfa',
    component: SetupMfaComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
]; 