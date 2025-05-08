import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from './auth.service';
import { NotificationService } from '../../services/notification.service';

export interface ReportOptions {
  title: string;
  filename: string;
  columns: { header: string; dataKey: string }[];
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
  includeTimestamp?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  /**
   * Test basic access to the reports API
   * This can help diagnose authentication issues
   */
  testReportAccess(): Observable<any> {
    console.log('Testing report access...');
    
    const token = localStorage.getItem('access_token');
    console.log('Current token exists:', !!token);
    if (token) {
      // Log just the first 10 chars of the token for privacy
      console.log('Token preview:', token.substring(0, 10) + '...');
    }
    
    // Log detailed token information
    this.authService.getTokenService().logTokenDetails();
    
    return this.http.get(`${this.apiUrl}/test-access`).pipe(
      tap(response => {
        console.log('Access test successful:', response);
      }),
      catchError(error => {
        console.error('Access test failed:', error);
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        return throwError(() => new Error('Failed to access reports API'));
      })
    );
  }

  /**
   * Generate a PDF report from table data
   * @param data Array of objects to display in the table
   * @param options Report configuration options
   */
  generatePdfReport(data: any[], options: ReportOptions): void {
    const { title, filename, columns, orientation = 'portrait', pageSize = 'a4', includeTimestamp = true } = options;
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize
    });
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add timestamp if requested
    if (includeTimestamp) {
      doc.setFontSize(10);
      const timestamp = new Date().toLocaleString();
      doc.text(`Generated: ${timestamp}`, 14, 30);
    }
    
    // Format data for autotable
    const headers = columns.map(col => col.header);
    const dataKeys = columns.map(col => col.dataKey);
    
    // Create table
    autoTable(doc, {
      startY: includeTimestamp ? 35 : 30,
      head: [headers],
      body: data.map(row => dataKeys.map(key => this.formatCellValue(this.getNestedProperty(row, key)))),
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        text: { cellWidth: 'auto' }
      },
      didDrawPage: (data: any) => {
        // Add page numbers
        doc.setFontSize(10);
        doc.text(`Page ${doc.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
  }

  /**
   * Request a report from the backend and download it
   */
  downloadServerReport(reportType: string, params: any = {}): Observable<boolean> {
    console.log(`Generating ${reportType} report with params:`, params);
    
    // Get current auth token for headers
    const token = localStorage.getItem('access_token');
    
    // Clean params by removing empty values
    const cleanParams: Record<string, any> = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
      'Accept': 'application/pdf'
    });

    // Now, use the direct approach with HttpClient for more reliable downloads
    return this.http.post(`${this.apiUrl}/${reportType}`, cleanParams, {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        const blob = new Blob([response.body as BlobPart], { type: 'application/pdf' });
        
        // Get filename from Content-Disposition header if available
        let filename = `${this.formatReportType(reportType)}_Report_${new Date().toISOString().slice(0,10)}.pdf`;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        
        // Create download link and trigger click
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        
        // Logging for debugging
        console.log('Download link created with URL:', downloadUrl);
        console.log('Filename:', filename);
        
        // Trigger download
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
        
        this.notificationService.showSuccess(`${this.formatReportType(reportType)} report downloaded successfully`);
        return true;
      }),
      catchError((error) => {
        console.error('Error generating report:', error);
        
        if (error.status === 204) {
          this.notificationService.showInfo(`No data available for the ${this.formatReportType(reportType)} report`);
          return of(true);
        } else {
          this.notificationService.showError(`Failed to download report: ${error.message || 'Unknown error'}`);
          return throwError(() => new Error('Failed to download report'));
        }
      })
    );
  }

  // Alternative form-based approach (saved for reference)
  downloadServerReportForm(reportType: string, params: any = {}): Observable<boolean> {
    // Debug logging
    console.log(`Requesting report: ${reportType} with params:`, params);
    
    // Get current auth token
    const token = localStorage.getItem('access_token');
    
    // Create a form approach to download the PDF with authentication
    // This is more reliable for authentication and CORS handling
    const formId = `report-form-${Date.now()}`;
    
    // Create a temporary form element
    const form = document.createElement('form');
    form.id = formId;
    form.method = 'POST';
    form.action = `${this.apiUrl}/${reportType}`;
    form.target = '_blank'; // Open in new tab
    form.style.display = 'none';
    
    // Add authentication token as hidden field
    const authField = document.createElement('input');
    authField.type = 'hidden';
    authField.name = 'Authorization';
    authField.value = `Bearer ${token || ''}`;
    form.appendChild(authField);
    
    // Add all parameters as hidden fields
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const field = document.createElement('input');
        field.type = 'hidden';
        field.name = key;
        field.value = String(value);
        form.appendChild(field);
      }
    });
    
    // Add form to document, submit it, and remove it
    document.body.appendChild(form);
    console.log(`Submitting form to: ${form.action}`);
    form.submit();
    
    // Remove form after submission
    setTimeout(() => {
      const formElement = document.getElementById(formId);
      if (formElement) {
        document.body.removeChild(formElement);
      }
    }, 1000);
    
    // Show success notification
    this.notificationService.showSuccess(`${this.formatReportType(reportType)} report request sent`);
    
    // Return success
    return of(true);
  }

  /**
   * Helper method to access nested properties using dot notation
   * e.g. getNestedProperty({user: {name: 'John'}}, 'user.name') returns 'John'
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

  /**
   * Format cell values for display
   */
  private formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }

  /**
   * Format report type for display in notifications
   */
  private formatReportType(reportType: string): string {
    // Convert kebab-case to Title Case
    return reportType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 