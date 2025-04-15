import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  
  constructor(private http: HttpClient) { }
  
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/password/forgot`, { email });
  }
  
  verifyResetCode(email: string, resetCode: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/password/verify-code`, { email, resetCode });
  }
  
  resetPassword(email: string, resetCode: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/password/reset`, { 
      email, 
      resetCode, 
      newPassword 
    });
  }
} 