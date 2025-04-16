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

// New interfaces for statistics
export interface StatusCountDTO {
  status: string;
  count: number;
}

export interface CrimeTypeCountDTO {
  crimeType: string;
  count: number;
}

export interface ComplaintStatistics {
  totalComplaints: number;
  pendingComplaints: number;
  underInvestigationComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  closedComplaints: number;
  complaintsByCategory: { [key: string]: number };
  highPriorityComplaints: number;
  totalEvidenceUploads: number;
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

  getMyComplaints(): Observable<ComplaintResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/my-complaints`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        // Handle paginated response
        const complaints = response.content || response;
        return complaints.map((dto: any) => ({
          id: dto.id,
          userId: dto.userId,
          userName: dto.userName,
          crimeType: dto.category || 'N/A',
          category: dto.category,
          description: dto.description,
          status: dto.status,
          dateFiled: dto.createdAt || dto.incidentDate,
          dateLastUpdated: dto.updatedAt,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
          location: dto.location,
          priorityScore: dto.priorityScore || 0,
          evidences: dto.evidenceFileNames?.map((fileName: string) => ({
            fileUrl: `/uploads/${fileName}`,
            fileType: null,
            uploadedAt: null
          })) || [],
          comments: dto.comments || []
        }));
      }),
      catchError(error => {
        console.error('Error fetching my complaints:', error);
        let errorMessage = 'Failed to fetch your complaints';
        if (error.error && error.error.message) {
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

  getComplaintStatistics(): Observable<ComplaintStatistics> {
    return this.http.get<any>(`${this.apiUrl}/statistics`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const byStatus: StatusCountDTO[] = response.byStatus || [];
        const byCrimeType: CrimeTypeCountDTO[] = response.byCrimeType || [];
        return {
          totalComplaints: byStatus.reduce((sum: number, s: StatusCountDTO) => sum + s.count, 0),
          pendingComplaints: byStatus.find((s: StatusCountDTO) => s.status === 'SUBMITTED')?.count || 0,
          underInvestigationComplaints: byStatus
            .filter((s: StatusCountDTO) => ['UNDER_REVIEW', 'ASSIGNED', 'INVESTIGATING', 'PENDING_EVIDENCE'].includes(s.status))
            .reduce((sum: number, s: StatusCountDTO) => sum + s.count, 0),
          resolvedComplaints: byStatus.find((s: StatusCountDTO) => s.status === 'RESOLVED')?.count || 0,
          rejectedComplaints: byStatus.find((s: StatusCountDTO) => s.status === 'REJECTED')?.count || 0,
          closedComplaints: byStatus.find((s: StatusCountDTO) => s.status === 'CLOSED')?.count || 0,
          complaintsByCategory: byCrimeType.reduce((acc: { [key: string]: number }, c: CrimeTypeCountDTO) => {
            acc[c.crimeType] = c.count;
            return acc;
          }, {}),
          highPriorityComplaints: 0, // Not available in /statistics
          totalEvidenceUploads: 0 // Not available in /statistics
        };
      }),
      catchError(error => {
        console.error('Error fetching statistics:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch statistics'));
      })
    );
  }

  getUserComplaintStatistics(): Observable<ComplaintStatistics> {
    return this.getMyComplaints().pipe(
      map(complaints => ({
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter(c => c.status === 'SUBMITTED').length,
        underInvestigationComplaints: complaints.filter(c =>
          ['UNDER_REVIEW', 'ASSIGNED', 'INVESTIGATING', 'PENDING_EVIDENCE'].includes(c.status)
        ).length,
        resolvedComplaints: complaints.filter(c => c.status === 'RESOLVED').length,
        rejectedComplaints: complaints.filter(c => c.status === 'REJECTED').length,
        closedComplaints: complaints.filter(c => c.status === 'CLOSED').length,
        complaintsByCategory: complaints.reduce((acc: { [key: string]: number }, c) => {
          const category = c.crimeType || 'Unknown';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {}),
        highPriorityComplaints: complaints.filter(c => c.priorityScore > 50).length,
        totalEvidenceUploads: complaints.reduce((sum: number, c) => sum + (c.evidences?.length || 0), 0)
      }))
    );
  }

  getFileUrl(fileUrl: string): string {
    if (!fileUrl) return '';

    let cleanUrl = fileUrl.trim();

    if (cleanUrl.includes('\\')) {
      cleanUrl = cleanUrl.replace(/\\/g, '/');
    }

    if (!cleanUrl.includes('/')) {
      cleanUrl = `/uploads/${cleanUrl}`;
    }

    if (!cleanUrl.startsWith('/uploads/') && cleanUrl.includes('.')) {
      const parts = cleanUrl.split('/');
      const filename = parts[parts.length - 1];
      cleanUrl = `/uploads/${filename}`;
    }

    const apiBaseUrl = environment.apiUrl;
    let baseUrl = apiBaseUrl;

    if (baseUrl.includes('/api/v1')) {
      baseUrl = baseUrl.replace('/api/v1', '');
    }

    const baseWithoutTrailingSlash = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    const fullUrl = `${baseWithoutTrailingSlash}${cleanUrl}`;
    console.log('Final image URL:', fullUrl);

    return fullUrl;
  }

  getEvidenceFile(fileUrl: string): Observable<Blob> {
    const url = this.getFileUrl(fileUrl);
    console.log('Fetching file as blob from:', url);

    return this.http.get(url, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error fetching evidence file:', error);
        return throwError(() => new Error('Failed to load evidence file'));
      })
    );
  }
}
