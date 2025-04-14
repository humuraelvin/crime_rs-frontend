import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Department } from '../core/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/v1/admin`;

  constructor(private http: HttpClient) { }

  // Department methods
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments/${id}`);
  }

  createDepartment(department: any): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/departments`, department);
  }

  updateDepartment(id: number, department: any): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/departments/${id}`, department);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/departments/${id}`);
  }

  // Method to get paged departments if needed for performance
  getAllDepartmentsPaged(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/departments/paged?page=${page}&size=${size}`);
  }
} 