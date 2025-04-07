import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '/dashboard';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Redirect to dashboard if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    
    const loginRequest: LoginRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value
    };

    this.authService.login(loginRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.toastr.success('Login successful');
          this.router.navigate([this.returnUrl]);
        },
        error: error => {
          console.error('Login error:', error);
          this.toastr.error(error.message || 'Login failed. Please check your credentials and try again.');
        }
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
} 