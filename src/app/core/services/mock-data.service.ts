import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  constructor() { }
  
  getStatisticsMockData(): any {
    return {
      total: 38,
      byStatus: {
        'PENDING': 15,
        'UNDER_INVESTIGATION': 8,
        'RESOLVED': 12,
        'REJECTED': 3
      },
      byPriority: {
        'LOW': 10,
        'MEDIUM': 18,
        'HIGH': 10
      },
      byCrimeType: {
        'THEFT': 12,
        'ASSAULT': 8,
        'FRAUD': 6,
        'VANDALISM': 4,
        'OTHER': 8
      }
    };
  }
  
  // This version guarantees non-empty statistics for when we need to ensure values are displayed
  getGuaranteedStatistics(): any {
    return {
      total: 38,
      byStatus: {
        'PENDING': 15,
        'UNDER_INVESTIGATION': 8,
        'RESOLVED': 12,
        'REJECTED': 3
      }
    };
  }
  
  getRecentComplaintsMockData(): any[] {
    return [
      {
        id: 1001,
        crimeType: 'THEFT',
        status: 'PENDING',
        dateFiled: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        dateLastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        description: 'Theft of personal property from vehicle',
        location: '123 Main St',
        userId: 1,
        userName: 'John Doe'
      },
      {
        id: 1002,
        crimeType: 'ASSAULT',
        status: 'UNDER_INVESTIGATION',
        dateFiled: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        dateLastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        description: 'Physical altercation outside a store',
        location: '456 Oak Ave',
        userId: 2,
        userName: 'Jane Smith'
      },
      {
        id: 1003,
        crimeType: 'FRAUD',
        status: 'RESOLVED',
        dateFiled: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
        dateLastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        description: 'Credit card fraud from online transaction',
        location: 'Online',
        userId: 3,
        userName: 'Robert Johnson'
      },
      {
        id: 1004,
        crimeType: 'VANDALISM',
        status: 'REJECTED',
        dateFiled: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        dateLastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
        description: 'Graffiti on public property',
        location: '789 Pine St, Public Park',
        userId: 4,
        userName: 'Emily Davis'
      },
      {
        id: 1005,
        crimeType: 'OTHER',
        status: 'PENDING',
        dateFiled: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        dateLastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        description: 'Suspicious activity near residential area',
        location: '321 Elm St',
        userId: 5,
        userName: 'Michael Wilson'
      }
    ];
  }
  
  getMockStatistics(): Observable<any> {
    return of(this.getStatisticsMockData());
  }
  
  getMockComplaints(): Observable<any[]> {
    return of(this.getRecentComplaintsMockData());
  }
} 