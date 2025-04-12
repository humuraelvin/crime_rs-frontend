import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

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
  description: string;
  status: string;
  dateFiled: string;
  dateLastUpdated: string;
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

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = `${environment.apiUrl}/complaints`;

  constructor(private http: HttpClient) { }

  // Helper method to get authorization headers
  private getAuthHeaders(): HttpHeaders {
    const user = localStorage.getItem('currentUser') 
      ? JSON.parse(localStorage.getItem('currentUser') || '{}')
      : null;
      
    let headers = new HttpHeaders();
    if (user?.accessToken) {
      headers = headers.set('Authorization', `Bearer ${user.accessToken}`);
    }
    return headers;
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

    return this.http.get<ComplaintResponse[]>(`${environment.apiUrl}/complaints`, { 
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching complaints:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch complaints'));
      })
    );
  }

  getComplaintById(id: number): Observable<ComplaintResponse> {
    return this.http.get<ComplaintResponse>(`${environment.apiUrl}/complaints/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching complaint:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch complaint'));
      })
    );
  }

  createComplaint(complaint: ComplaintRequest): Observable<ComplaintResponse> {
    // If no files are provided, use the standard JSON endpoint
    if (!complaint.evidenceFiles || complaint.evidenceFiles.length === 0) {
      console.log('Creating complaint with data:', complaint);
      console.log('API URL:', `${environment.apiUrl}/complaints`);
      
      return this.http.post<ComplaintResponse>(
        `${environment.apiUrl}/complaints`, 
        complaint,
        { headers: this.getAuthHeaders() }
      ).pipe(
        catchError(error => {
          console.error('Error creating complaint:', error);
          // More detailed error handling
          let errorMessage = 'Failed to create complaint';
          
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.status === 403) {
              errorMessage = 'You are not authorized to create a complaint. Please log in again.';
            } else if (error.status === 400) {
              errorMessage = 'Invalid complaint data. Please check your form and try again.';
            } else if (error.status === 0) {
              errorMessage = 'Could not connect to the server. Please check your internet connection.';
            }
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
    }
    
    // Try a completely different approach for debugging purposes
    // We'll bypass the FormData and submit as a basic request
    return this.createComplaintWithoutFormData(complaint);
  }
  
  // Better method for handling form data with evidence
  private createComplaintWithoutFormData(complaint: ComplaintRequest): Observable<ComplaintResponse> {
    console.log('Creating complaint with evidence', complaint);
    
    const formData = new FormData();
    
    // Add all essential fields
    formData.append('type', complaint.type);
    formData.append('description', complaint.description);
    formData.append('location', complaint.location);
    
    if (complaint.priority) {
      formData.append('priority', complaint.priority);
    }
    
    // Add reporter information
    formData.append('fullName', complaint.fullName || '');
    formData.append('contact', complaint.contact || '');
    formData.append('email', complaint.email || '');
    formData.append('incidentDate', complaint.incidentDate || new Date().toISOString());
    
    // Add files with correct key
    if (complaint.evidenceFiles && complaint.evidenceFiles.length > 0) {
      complaint.evidenceFiles.forEach((file, index) => {
        // Try with just 'files' as the key (most Spring Boot implementations expect this)
        formData.append('files', file);
      });
    }
    
    // Log what we're sending
    console.log('Submitting complaint with FormData:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`- ${key}: File: ${value.name}, Size: ${value.size}, Type: ${value.type}`);
      } else {
        console.log(`- ${key}: ${value}`);
      }
    });
    
    // Get auth headers
    let headers = this.getAuthHeaders();
    // For FormData, we only set Accept and let the browser handle Content-Type
    headers = headers.set('Accept', 'application/json');
    
    // Use specific headers that are compatible with multipart/form-data
    return this.http.post<ComplaintResponse>(
      `${environment.apiUrl}/complaints/with-evidence`, 
      formData,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error creating complaint with evidence:', error);
        
        let errorMessage = 'Failed to create complaint';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 403) {
            errorMessage = 'You are not authorized to create a complaint. Please log in again.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid complaint data. Please check your form and try again.';
          } else if (error.status === 413) {
            errorMessage = 'File size exceeds the maximum limit allowed by the server.';
          } else if (error.status === 415) {
            errorMessage = 'File type not supported.';
          } else if (error.status === 0) {
            errorMessage = 'Could not connect to the server. Please check your internet connection.';
          }
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateComplaint(id: number, complaint: Partial<Complaint>): Observable<Complaint> {
    return this.http.put<Complaint>(
      `${this.apiUrl}/${id}`, 
      complaint,
      { headers: this.getAuthHeaders() }
    );
  }

  updateComplaintStatus(id: number, status: string): Observable<Complaint> {
    return this.http.patch<Complaint>(
      `${this.apiUrl}/${id}/status`, 
      { status },
      { headers: this.getAuthHeaders() }
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

  uploadEvidence(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Get auth headers
    let headers = this.getAuthHeaders();
    // For FormData, we only set Accept and let the browser handle Content-Type
    headers = headers.set('Accept', 'application/json');

    return this.http.post<string[]>(
      `${environment.apiUrl}/complaints/upload-evidence`, 
      formData, 
      {
        reportProgress: true,
        observe: 'events',
        headers
      }
    ).pipe(
      map(event => {
        if (event.type === HttpEventType.Response) {
          return event.body as string[];
        }
        // Return empty array for progress events
        return [];
      }),
      catchError(error => {
        console.error('Error uploading evidence:', error);
        let errorMessage = 'Failed to upload evidence';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 403) {
            errorMessage = 'You are not authorized to upload evidence. Please log in again.';
          } else if (error.status === 413) {
            errorMessage = 'File size exceeds the maximum limit allowed by the server.';
          } else if (error.status === 415) {
            errorMessage = 'File type not supported.';
          }
        }
        
        return throwError(() => new Error(errorMessage));
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
} 