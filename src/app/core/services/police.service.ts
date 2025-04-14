import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';

export interface PoliceStats {
  assignedComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  totalCases: number;
  activeCases: number;
  closedCases: number;
  badgeNumber: string;
  departmentName: string;
  rank: string;
  recentComplaints: any[];
}

export interface AssignedComplaint {
  id: number;
  userId: number;
  userName: string;
  crimeType: string;
  description: string;
  status: string;
  dateFiled: string;
  dateLastUpdated: string;
  location: string;
  priorityScore: number;
  evidences?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PoliceService {
  private apiUrl = `${environment.apiUrl}/police`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getPoliceStats(): Observable<PoliceStats> {
    return this.http.get<PoliceStats>(`${this.apiUrl}/stats`, {
      headers: this.getAuthHeaders()
    });
  }

  getAssignedComplaints(): Observable<AssignedComplaint[]> {
    return this.http.get<AssignedComplaint[]>(`${this.apiUrl}/complaints/assigned`, {
      headers: this.getAuthHeaders()
    });
  }

  updateComplaintStatus(complaintId: number, status: string, notes?: string): Observable<any> {
    const payload = {
      status,
      notes
    };
    
    return this.http.put(`${this.apiUrl}/complaints/${complaintId}/status`, payload, {
      headers: this.getAuthHeaders()
    });
  }
} 