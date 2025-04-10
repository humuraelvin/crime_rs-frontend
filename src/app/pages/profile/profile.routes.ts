import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileComponent
  },
  {
    path: 'edit',
    component: EditProfileComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent
  }
]; 