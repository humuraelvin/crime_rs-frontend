import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  developerName = 'Elvin Humura';
  currentYear = new Date().getFullYear();
  features = [
    {
      title: 'Report Crimes Easily',
      description: 'Submit crime reports with details, location, and evidence in minutes.',
      icon: 'report'
    },
    {
      title: 'Track Investigation Status',
      description: 'Monitor the progress of reported incidents with real-time updates.',
      icon: 'track'
    },
    {
      title: 'Crime Mapping',
      description: 'Visualize crime trends in your area with interactive crime maps.',
      icon: 'map'
    },
    {
      title: 'Secure Communication',
      description: 'Stay in touch with investigators through our encrypted messaging system.',
      icon: 'secure'
    }
  ];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
} 