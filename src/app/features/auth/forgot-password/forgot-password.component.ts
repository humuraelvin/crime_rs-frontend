import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  success = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  get f() { return this.forgotPasswordForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.f['email'].value)
      .subscribe({
        next: () => {
          this.success = true;
          this.toastr.success('Password reset email sent. Please check your inbox for instructions.', 'Success');
          this.loading = false;
        },
        error: error => {
          this.toastr.error(error.error?.message || 'Failed to send password reset email. Please try again.', 'Error');
          this.loading = false;
        }
      });
  }
} 