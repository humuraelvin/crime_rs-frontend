import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Complaint {
  id: number;
  type: string;
  description: string;
  location: string;
  status: 'pending' | 'under_investigation' | 'resolved';
  createdAt: string;
  updatedAt: string;
  reporterId: number;
  assignedOfficerId?: number;
  priority: 'low' | 'medium' | 'high';
  evidenceUrls?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
}

export interface ComplaintFilter {
  status?: string;
  type?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = `${environment.apiUrl}/complaints`;

  constructor(private http: HttpClient) { }

  getComplaints(filters?: ComplaintFilter): Observable<Complaint[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.priority) {
        params = params.set('priority', filters.priority);
      }
      if (filters.dateRange?.start) {
        params = params.set('startDate', filters.dateRange.start);
      }
      if (filters.dateRange?.end) {
        params = params.set('endDate', filters.dateRange.end);
      }
    }

    return this.http.get<Complaint[]>(this.apiUrl, { params });
  }

  getComplaintById(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.apiUrl}/${id}`);
  }

  createComplaint(complaint: Partial<Complaint>): Observable<Complaint> {
    return this.http.post<Complaint>(this.apiUrl, complaint);
  }

  updateComplaint(id: number, complaint: Partial<Complaint>): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.apiUrl}/${id}`, complaint);
  }

  updateComplaintStatus(id: number, status: string): Observable<Complaint> {
    return this.http.patch<Complaint>(`${this.apiUrl}/${id}/status`, { status });
  }

  assignOfficer(id: number, officerId: number): Observable<Complaint> {
    return this.http.patch<Complaint>(`${this.apiUrl}/${id}/assign`, { officerId });
  }

  addComment(id: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${id}/comments`, { content });
  }

  uploadEvidence(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/${id}/evidence`, formData);
  }

  deleteComplaint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getComplaintTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`);
  }

  getComplaintStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }
} 