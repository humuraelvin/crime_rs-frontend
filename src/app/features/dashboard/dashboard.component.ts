import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

interface DashboardStat {
  title: string;
  value: number;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  status: string;
  date: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  greeting: string = '';
  username: string = '';
  stats: DashboardStat[] = [];
  recentActivities: RecentActivity[] = [];
  
  // User role flags
  isAdmin: boolean = false;
  isPolice: boolean = false;
  isCitizen: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.setGreeting();
    this.loadUserInfo();
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  loadUserInfo(): void {
    if (this.authService.currentUserValue) {
      this.username = this.authService.currentUserValue.username;
      this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
      this.isPolice = this.authService.hasRole('ROLE_POLICE');
      this.isCitizen = this.authService.hasRole('ROLE_CITIZEN');
    }
  }

  loadDashboardStats(): void {
    // In a real app, these would be fetched from an API
    if (this.isAdmin) {
      this.stats = [
        { title: 'Total Reports', value: 128, icon: 'description', color: 'bg-blue-500' },
        { title: 'Open Cases', value: 42, icon: 'folder_open', color: 'bg-yellow-500' },
        { title: 'Closed Cases', value: 86, icon: 'check_circle', color: 'bg-green-500' },
        { title: 'Registered Users', value: 512, icon: 'people', color: 'bg-purple-500' }
      ];
    } else if (this.isPolice) {
      this.stats = [
        { title: 'Assigned Cases', value: 24, icon: 'assignment', color: 'bg-blue-500' },
        { title: 'Open Investigations', value: 18, icon: 'search', color: 'bg-yellow-500' },
        { title: 'Completed Cases', value: 32, icon: 'check_circle', color: 'bg-green-500' },
        { title: 'New Reports', value: 7, icon: 'new_releases', color: 'bg-red-500' }
      ];
    } else {
      // Citizen view
      this.stats = [
        { title: 'My Reports', value: 5, icon: 'description', color: 'bg-blue-500' },
        { title: 'In Progress', value: 2, icon: 'hourglass_empty', color: 'bg-yellow-500' },
        { title: 'Resolved', value: 3, icon: 'check_circle', color: 'bg-green-500' },
        { title: 'Nearby Incidents', value: 12, icon: 'place', color: 'bg-red-500' }
      ];
    }
  }

  loadRecentActivities(): void {
    // In a real app, these would be fetched from an API
    if (this.isAdmin) {
      this.recentActivities = [
        { id: 1, type: 'report', title: 'New theft report submitted', status: 'new', date: '20 min ago', icon: 'notifications' },
        { id: 2, type: 'user', title: 'New police officer registered', status: 'pending', date: '1 hour ago', icon: 'person_add' },
        { id: 3, type: 'case', title: 'Case #1234 updated', status: 'updated', date: '3 hours ago', icon: 'update' },
        { id: 4, type: 'report', title: 'Assault report approved', status: 'approved', date: 'Yesterday', icon: 'check_circle' },
        { id: 5, type: 'system', title: 'System maintenance completed', status: 'completed', date: '2 days ago', icon: 'build' }
      ];
    } else if (this.isPolice) {
      this.recentActivities = [
        { id: 1, type: 'case', title: 'New case assigned to you', status: 'assigned', date: '30 min ago', icon: 'assignment_ind' },
        { id: 2, type: 'case', title: 'Case #2345 requires update', status: 'pending', date: '2 hours ago', icon: 'pending_actions' },
        { id: 3, type: 'report', title: 'Evidence added to case #1234', status: 'updated', date: '4 hours ago', icon: 'add_photo_alternate' },
        { id: 4, type: 'notification', title: 'Supervisor left a comment', status: 'new', date: 'Yesterday', icon: 'comment' },
        { id: 5, type: 'case', title: 'Case #1122 closed successfully', status: 'closed', date: '2 days ago', icon: 'task_alt' }
      ];
    } else {
      // Citizen view
      this.recentActivities = [
        { id: 1, type: 'report', title: 'Your theft report was received', status: 'received', date: '1 day ago', icon: 'receipt_long' },
        { id: 2, type: 'report', title: 'Officer assigned to your case', status: 'assigned', date: '12 hours ago', icon: 'assignment_ind' },
        { id: 3, type: 'notification', title: 'Follow-up requested on report #3456', status: 'action', date: '2 hours ago', icon: 'mark_email_unread' },
        { id: 4, type: 'alert', title: 'Safety alert in your neighborhood', status: 'alert', date: '30 min ago', icon: 'warning' },
        { id: 5, type: 'report', title: 'Your previous case was resolved', status: 'closed', date: '1 week ago', icon: 'task_alt' }
      ];
    }
  }
} 