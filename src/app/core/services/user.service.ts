import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private roleUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) { }

  // User operations
  getUsers(page: number = 0, size: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  enableUser(id: number, enabled: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/enable`, { enabled });
  }

  assignRoles(id: number, roles: string[]): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${id}/roles`, { roles });
  }

  // Role operations
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.roleUrl);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.roleUrl}/${id}`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.roleUrl, role);
  }

  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.roleUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.roleUrl}/${id}`);
  }

  // Police Officer specific operations
  getPoliceOfficers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/officers`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${environment.apiUrl}/admin/users?size=100`)
      .pipe(
        map(response => response.content)
      );
  }

  getOfficerStatistics(officerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/officers/${officerId}/statistics`);
  }

  getOfficerAssignedComplaints(officerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/officers/${officerId}/complaints`);
  }
} 