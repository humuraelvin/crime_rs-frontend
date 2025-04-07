import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  value: boolean;
}

interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  value: boolean;
}

interface ThemeOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  themeForm: FormGroup;
  loading = false;
  isAdmin = false;

  themeOptions: ThemeOption[] = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'system', name: 'System Default' }
  ];

  notificationSettings: NotificationSetting[] = [
    {
      id: 'email_notifications',
      label: 'Email Notifications',
      description: 'Receive email notifications about updates to your reports and important announcements',
      value: true
    },
    {
      id: 'status_updates',
      label: 'Status Updates',
      description: 'Get notified when the status of your reports changes',
      value: true
    },
    {
      id: 'nearby_crimes',
      label: 'Nearby Crime Alerts',
      description: 'Receive alerts about crimes reported in your area',
      value: false
    }
  ];

  privacySettings: PrivacySetting[] = [
    {
      id: 'profile_visibility',
      label: 'Profile Visibility',
      description: 'Allow your profile to be visible to law enforcement agencies',
      value: true
    },
    {
      id: 'location_tracking',
      label: 'Location Tracking',
      description: 'Allow the app to use your location for better crime reporting and alerts',
      value: true
    },
    {
      id: 'anonymous_reports',
      label: 'Anonymous Reporting',
      description: 'Submit reports anonymously by default',
      value: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.notificationForm = this.fb.group({});
    this.privacyForm = this.fb.group({});
    this.themeForm = this.fb.group({
      theme: ['system']
    });
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.initForms();
  }

  initForms(): void {
    // Dynamically add form controls for notification settings
    const notificationGroup: any = {};
    this.notificationSettings.forEach(setting => {
      notificationGroup[setting.id] = [setting.value];
    });
    this.notificationForm = this.fb.group(notificationGroup);

    // Dynamically add form controls for privacy settings
    const privacyGroup: any = {};
    this.privacySettings.forEach(setting => {
      privacyGroup[setting.id] = [setting.value];
    });
    this.privacyForm = this.fb.group(privacyGroup);
  }

  onSubmitNotificationSettings(): void {
    if (this.notificationForm.valid) {
      this.loading = true;
      
      // In a real app, you would save these settings to the backend
      // For now, we'll just simulate with a timeout
      setTimeout(() => {
        this.updateNotificationSettings();
        this.loading = false;
        this.toastr.success('Notification settings updated successfully');
      }, 800);
    }
  }

  onSubmitPrivacySettings(): void {
    if (this.privacyForm.valid) {
      this.loading = true;
      
      // In a real app, you would save these settings to the backend
      // For now, we'll just simulate with a timeout
      setTimeout(() => {
        this.updatePrivacySettings();
        this.loading = false;
        this.toastr.success('Privacy settings updated successfully');
      }, 800);
    }
  }

  saveThemeSettings(): void {
    this.loading = true;
    
    // In a real app, you would save these settings to the backend
    // For now, we'll just simulate with a timeout
    setTimeout(() => {
      const selectedTheme = this.themeForm.get('theme')?.value;
      // Apply theme (in a real app, this would likely be a service call)
      document.documentElement.setAttribute('data-theme', selectedTheme);
      
      this.loading = false;
      this.toastr.success('Theme settings updated successfully');
    }, 800);
  }

  private updateNotificationSettings(): void {
    const formValues = this.notificationForm.value;
    this.notificationSettings.forEach(setting => {
      setting.value = formValues[setting.id];
    });
    
    // Here you would typically make an API call to save the settings
    console.log('Updated notification settings:', this.notificationSettings);
  }

  private updatePrivacySettings(): void {
    const formValues = this.privacyForm.value;
    this.privacySettings.forEach(setting => {
      setting.value = formValues[setting.id];
    });
    
    // Here you would typically make an API call to save the settings
    console.log('Updated privacy settings:', this.privacySettings);
  }
} 