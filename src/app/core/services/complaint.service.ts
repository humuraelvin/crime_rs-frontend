import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';

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

export interface ComplaintRequest {
  fullName: string;
  contact: string;
  email: string;
  incidentDate: string;
  location: string;
  type: string;
  description: string;
  priority?: string;
  evidenceFiles?: File[];
  [key: string]: any; // Add index signature to allow string indexing
}

export interface ComplaintResponse {
  id: number;
  userId: number;
  userName: string;
  crimeType: string;
  category?: string;
  description: string;
  status: string;
  dateFiled: string;
  dateLastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
  location: string;
  priorityScore: number;
  evidences?: Array<{
    id?: number;
    fileUrl: string;
    fileType?: string;
    uploadedAt?: string;
  }>;
  comments?: Array<{
    id: number;
    content: string;
    authorId: number;
    authorName: string;
    createdAt: string;
  }>;
}

export interface EvidenceResponse {
  id: number;
  complaintId: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadDate: string;
  description?: string;
}

export interface ComplaintCreateRequest {
  userId: number;
  crimeType: string;
  description: string;
  location: string;
  priority?: string;
  evidenceFiles?: File[];
}

export interface ComplaintUpdateRequest {
  id: number;
  status?: string;
  assignedOfficerId?: number;
  notes?: string;
}

export interface EvidenceUploadRequest {
  complaintId: number;
  file: File;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = `${environment.apiUrl}/complaints`;

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

  getComplaints(filters?: ComplaintFilter): Observable<ComplaintResponse[]> {
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

    return this.http.get<ComplaintResponse[]>(`${this.apiUrl}`, { 
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching complaints:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch complaints'));
      })
    );
  }

  // Get complaints for the current user
  getMyComplaints(): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.apiUrl}/my-complaints`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching my complaints:', error);
        
        let errorMessage = 'Failed to fetch your complaints';
        if (error.error && error.error.message) {
          // Use the error message from the server if available
          errorMessage = error.error.message;
          console.error('Server error details:', error.error);
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getComplaintById(id: number): Observable<ComplaintResponse> {
    return this.http.get<ComplaintResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching complaint:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch complaint'));
      })
    );
  }

  createComplaint(complaint: ComplaintCreateRequest): Observable<ComplaintResponse> {
    return this.http.post<ComplaintResponse>(`${this.apiUrl}`, complaint, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating complaint:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create complaint'));
      })
    );
  }

  updateComplaint(complaint: ComplaintUpdateRequest): Observable<ComplaintResponse> {
    return this.http.put<ComplaintResponse>(`${this.apiUrl}/${complaint.id}`, complaint, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating complaint:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update complaint'));
      })
    );
  }

  updateComplaintStatus(id: number, status: string): Observable<ComplaintResponse> {
    return this.http.put<ComplaintResponse>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error updating complaint status:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update complaint status'));
      })
    );
  }

  assignOfficer(id: number, officerId: number): Observable<Complaint> {
    return this.http.patch<Complaint>(
      `${this.apiUrl}/${id}/assign`, 
      { officerId },
      { headers: this.getAuthHeaders() }
    );
  }

  addComment(id: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/${id}/comments`, 
      { content },
      { headers: this.getAuthHeaders() }
    );
  }

  uploadEvidence(evidence: EvidenceUploadRequest): Observable<EvidenceResponse> {
    const formData = new FormData();
    formData.append('file', evidence.file);
    if (evidence.description) {
      formData.append('description', evidence.description);
    }

    // Don't use the JSON content type for multipart form data
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<EvidenceResponse>(
      `${this.apiUrl}/${evidence.complaintId}/evidences`,
      formData,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error uploading evidence:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to upload evidence'));
      })
    );
  }

  deleteComplaint(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getComplaintTypes(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/types`,
      { headers: this.getAuthHeaders() }
    );
  }

  getComplaintStatistics(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/statistics`, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching statistics:', error);
        return throwError(() => error);
      })
    );
  }

  // Direct method to get evidence file with proper headers and response type
  getEvidenceFile(fileUrl: string): Observable<Blob> {
    // Handle relative vs absolute paths
    let url = fileUrl;
    if (!url.startsWith('http')) {
      // Make sure uploads is included in the path
      if (!url.includes('/uploads/') && !url.startsWith('/uploads/')) {
        url = `/uploads/${url}`;
      }
      
      // Make sure we don't have double slashes
      if (url.startsWith('/')) {
        url = `${environment.apiUrl}${url}`;
      } else {
        url = `${environment.apiUrl}/${url}`;
      }
    }
    
    console.log('Fetching file from:', url);
    
    // For binary data, we need to set the correct headers
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'image/jpeg,image/png,image/gif,application/pdf,*/*'
    });

    return this.http.get(url, {
      headers: headers,
      responseType: 'blob',
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Error fetching evidence file:', error);
        return throwError(() => new Error('Failed to load evidence file'));
      })
    );
  }

  // Method to get direct URL to file with auth token
  getFileUrl(fileUrl: string): string {
    if (!fileUrl) return '';
    
    // Clean the URL
    let cleanUrl = fileUrl;
    if (cleanUrl.includes('\\')) {
      cleanUrl = cleanUrl.replace(/\\/g, '/');
    }
    
    // Make sure the URL includes /uploads/ 
    if (!cleanUrl.includes('/uploads/') && !cleanUrl.startsWith('/uploads/')) {
      cleanUrl = `/uploads/${cleanUrl}`;
    }
    
    // Add API URL
    let fullUrl = '';
    if (cleanUrl.startsWith('/')) {
      fullUrl = `${environment.apiUrl}${cleanUrl}`;
    } else {
      fullUrl = `${environment.apiUrl}/${cleanUrl}`;
    }
    
    // Add auth token
    const token = this.authService.getToken();
    if (token) {
      fullUrl += `?token=${encodeURIComponent(token)}`;
    }
    
    console.log('Generated file URL:', fullUrl);
    return fullUrl;
  }
} 