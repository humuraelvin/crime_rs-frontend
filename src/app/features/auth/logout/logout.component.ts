import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  template: '<div class="logout-loading">Logging out...</div>',
  styles: [`
    .logout-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 1.5rem;
      color: #4b5563;
    }
  `]
})
export class LogoutComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.authService.logout();
    this.toastr.success('You have been successfully logged out', 'Logout Successful');
    this.router.navigate(['/auth/login']);
  }
} 