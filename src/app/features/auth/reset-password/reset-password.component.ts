import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  token: string = '';
  otp: string = '';
  success = false;
  showOtpForm = false;
  email: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Get token from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      
      if (this.email) {
        this.resetPasswordForm.patchValue({ email: this.email });
        this.showOtpForm = true;
      }
    });
    
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  get f() { return this.resetPasswordForm.controls; }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.loading = true;

    const resetData = {
      email: this.f['email'].value,
      otp: this.f['otp'].value,
      newPassword: this.f['password'].value,
      token: this.token // Include token if available from URL
    };

    this.authService.resetPassword(this.token || this.f['otp'].value, this.f['password'].value)
      .subscribe({
        next: () => {
          this.success = true;
          this.toastr.success('Password has been reset successfully.');
          this.loading = false;
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: error => {
          this.toastr.error(error.error?.message || 'Failed to reset password. Please try again.');
          this.loading = false;
        }
      });
  }

  requestOtp(): void {
    if (!this.f['email'].valid) {
      this.toastr.error('Please enter a valid email address');
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.f['email'].value)
      .subscribe({
        next: () => {
          this.showOtpForm = true;
          this.toastr.success('OTP sent to your email address');
          this.loading = false;
        },
        error: error => {
          this.toastr.error(error.error?.message || 'Failed to send OTP. Please try again.');
          this.loading = false;
        }
      });
  }
} 