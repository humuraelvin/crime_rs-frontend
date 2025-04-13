import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // Sample department data
  private departments = [
    { id: 1, name: 'Central Police Department', location: 'Downtown', jurisdictionArea: 'Central District', contactNumber: '123-456-7890', email: 'central@police.gov', headOfficer: 'John Smith', officerCount: 45, description: 'Main police station serving the central district.' },
    { id: 2, name: 'Northern Division', location: 'North Side', jurisdictionArea: 'Northern District', contactNumber: '123-456-7891', email: 'north@police.gov', headOfficer: 'Sarah Johnson', officerCount: 32, description: 'Police station serving northern residential areas.' },
    { id: 3, name: 'Southern Division', location: 'South Side', jurisdictionArea: 'Southern District', contactNumber: '123-456-7892', email: 'south@police.gov', headOfficer: 'Mike Williams', officerCount: 28, description: 'Police station covering southern commercial and industrial zones.' }
  ];

  // Sample officer data
  private officers = [
    { id: 1, firstName: 'John', lastName: 'Doe', badgeNumber: 'PO-1234', email: 'john.doe@police.gov', phoneNumber: '123-456-7890', departmentId: 1, departmentName: 'Central Police Department', rank: 'Sergeant', specialization: 'Homicide', activeCasesCount: 3 },
    { id: 2, firstName: 'Jane', lastName: 'Smith', badgeNumber: 'PO-5678', email: 'jane.smith@police.gov', phoneNumber: '123-456-7891', departmentId: 1, departmentName: 'Central Police Department', rank: 'Detective', specialization: 'Fraud', activeCasesCount: 5 },
    { id: 3, firstName: 'Robert', lastName: 'Johnson', badgeNumber: 'PO-9012', email: 'robert.johnson@police.gov', phoneNumber: '123-456-7892', departmentId: 2, departmentName: 'Northern Division', rank: 'Officer', specialization: 'Traffic', activeCasesCount: 2 }
  ];

  // Sample complaint data
  private complaints = [
    { id: 1, title: 'Home Burglary', description: 'My home was broken into and valuables were stolen', status: 'SUBMITTED', location: '123 Main St', submittedDate: '2023-04-10T14:30:00', complainantName: 'Alice Brown', assignedOfficerId: null, assignedOfficerName: null },
    { id: 2, title: 'Vehicle Vandalism', description: 'My car was vandalized in the parking lot', status: 'UNDER_REVIEW', location: '456 Oak Ave', submittedDate: '2023-04-12T09:15:00', complainantName: 'Bob Williams', assignedOfficerId: null, assignedOfficerName: null },
    { id: 3, title: 'Noise Complaint', description: 'Loud construction noise during night hours', status: 'ASSIGNED', location: '789 Pine St', submittedDate: '2023-04-15T22:45:00', complainantName: 'Carol Johnson', assignedOfficerId: 1, assignedOfficerName: 'John Doe' }
  ];

  constructor() { }

  // Departments
  getDepartments(): Observable<any[]> {
    return of(this.departments);
  }

  getDepartment(id: number): Observable<any> {
    const department = this.departments.find(d => d.id === id);
    return of(department || null);
  }

  createDepartment(department: any): Observable<any> {
    const newDepartment = { 
      ...department, 
      id: Math.max(...this.departments.map(d => d.id), 0) + 1,
      officerCount: 0
    };
    this.departments.push(newDepartment);
    return of(newDepartment);
  }

  updateDepartment(id: number, department: any): Observable<any> {
    const index = this.departments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.departments[index] = { ...this.departments[index], ...department };
      return of(this.departments[index]);
    }
    return of(null);
  }

  deleteDepartment(id: number): Observable<any> {
    const index = this.departments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.departments.splice(index, 1);
    }
    return of({ success: true });
  }

  // Officers
  getOfficers(): Observable<any[]> {
    return of(this.officers);
  }

  getOfficersByDepartment(departmentId: number): Observable<any[]> {
    return of(this.officers.filter(o => o.departmentId === departmentId));
  }

  getOfficer(id: number): Observable<any> {
    const officer = this.officers.find(o => o.id === id);
    return of(officer || null);
  }

  createOfficer(officer: any): Observable<any> {
    const newOfficer = { 
      ...officer, 
      id: Math.max(...this.officers.map(o => o.id), 0) + 1,
      activeCasesCount: 0,
      departmentName: this.departments.find(d => d.id === officer.departmentId)?.name || 'Unknown Department'
    };
    this.officers.push(newOfficer);
    return of(newOfficer);
  }

  updateOfficer(id: number, officer: any): Observable<any> {
    const index = this.officers.findIndex(o => o.id === id);
    if (index !== -1) {
      if (officer.departmentId && officer.departmentId !== this.officers[index].departmentId) {
        officer.departmentName = this.departments.find(d => d.id === officer.departmentId)?.name || 'Unknown Department';
      }
      this.officers[index] = { ...this.officers[index], ...officer };
      return of(this.officers[index]);
    }
    return of(null);
  }

  deleteOfficer(id: number): Observable<any> {
    const index = this.officers.findIndex(o => o.id === id);
    if (index !== -1) {
      this.officers.splice(index, 1);
    }
    return of({ success: true });
  }

  // Complaints
  getComplaints(): Observable<any[]> {
    return of(this.complaints);
  }

  getComplaint(id: number): Observable<any> {
    const complaint = this.complaints.find(c => c.id === id);
    return of(complaint || null);
  }

  assignComplaint(complaintId: number, officerId: number): Observable<any> {
    const complaintIndex = this.complaints.findIndex(c => c.id === complaintId);
    const officer = this.officers.find(o => o.id === officerId);
    
    if (complaintIndex !== -1 && officer) {
      this.complaints[complaintIndex].assignedOfficerId = officerId;
      this.complaints[complaintIndex].assignedOfficerName = `${officer.firstName} ${officer.lastName}`;
      this.complaints[complaintIndex].status = 'ASSIGNED';
      
      // Update officer's active cases count
      const officerIndex = this.officers.findIndex(o => o.id === officerId);
      if (officerIndex !== -1) {
        this.officers[officerIndex].activeCasesCount += 1;
      }
      
      return of(this.complaints[complaintIndex]);
    }
    return of(null);
  }

  unassignComplaint(complaintId: number): Observable<any> {
    const complaintIndex = this.complaints.findIndex(c => c.id === complaintId);
    
    if (complaintIndex !== -1) {
      const officerId = this.complaints[complaintIndex].assignedOfficerId;
      this.complaints[complaintIndex].assignedOfficerId = null;
      this.complaints[complaintIndex].assignedOfficerName = null;
      this.complaints[complaintIndex].status = 'UNDER_REVIEW';
      
      // Update officer's active cases count
      if (officerId) {
        const officerIndex = this.officers.findIndex(o => o.id === officerId);
        if (officerIndex !== -1) {
          this.officers[officerIndex].activeCasesCount = Math.max(0, this.officers[officerIndex].activeCasesCount - 1);
        }
      }
      
      return of(this.complaints[complaintIndex]);
    }
    return of(null);
  }
} 