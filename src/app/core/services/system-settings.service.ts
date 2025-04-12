import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SystemSettings {
  id?: number;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  maintenanceMode: boolean;
  systemVersion: string;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  autoAssignComplaints: boolean;
  defaultPriorityLevel: string;
  retentionPeriodDays: number;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {
  private apiUrl = `${environment.apiUrl}/system-settings`;

  constructor(private http: HttpClient) { }

  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching system settings:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to fetch system settings'));
        })
      );
  }

  updateSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(this.apiUrl, settings)
      .pipe(
        catchError(error => {
          console.error('Error updating system settings:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to update system settings'));
        })
      );
  }

  resetToDefaults(): Observable<SystemSettings> {
    return this.http.post<SystemSettings>(`${this.apiUrl}/reset`, {})
      .pipe(
        catchError(error => {
          console.error('Error resetting system settings:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to reset system settings'));
        })
      );
  }
} 