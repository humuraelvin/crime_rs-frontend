import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  user: User | null = null;
  isPasswordFormVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      username: [{ value: '', disabled: true }],
      phoneNumber: ['', Validators.pattern(/^\d{10}$/)]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        username: this.user.username,
        phoneNumber: this.user.phoneNumber || ''
      });
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  togglePasswordForm(): void {
    this.isPasswordFormVisible = !this.isPasswordFormVisible;
    if (!this.isPasswordFormVisible) {
      this.passwordForm.reset();
    }
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const profileData = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      phoneNumber: this.profileForm.get('phoneNumber')?.value
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (user) => {
        this.user = user;
        this.toastr.success('Profile updated successfully');
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to update profile');
        this.loading = false;
      }
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    // Call to backend API to change password
    // This would typically be a method in the AuthService
    // For now, we'll simulate it with a timeout
    setTimeout(() => {
      this.toastr.success('Password changed successfully');
      this.loading = false;
      this.togglePasswordForm();
    }, 1000);
  }
} 