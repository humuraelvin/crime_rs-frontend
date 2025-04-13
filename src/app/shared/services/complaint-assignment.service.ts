import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Complaint {
  id: number;
  title: string;
  description: string;
  status: string;
  location: string;
  submittedDate: string;
  complainantName: string;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
}

export interface PoliceOfficer {
  id: number;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  departmentName: string;
  activeCasesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintAssignmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.apiUrl}/complaints`);
  }

  getOfficers(): Observable<PoliceOfficer[]> {
    return this.http.get<PoliceOfficer[]>(`${this.apiUrl}/officers`);
  }

  assignComplaint(complaintId: number, officerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/complaints/${complaintId}/assign/${officerId}`, {});
  }

  unassignComplaint(complaintId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/complaints/${complaintId}/unassign`, {});
  }
} 