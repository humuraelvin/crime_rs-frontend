import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResponse {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface HotspotResponse {
  latitude: number;
  longitude: number;
  crimeCount: number;
  dominantCrimeType: string;
  crimeTypeCounts: { [key: string]: number };
  averageSeverity: number;
  radiusKm: number;
}

export interface HotspotAnalysisRequest {
  startDate: Date;
  endDate: Date;
  minClusterSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/api/v1/location`;
  private hotspotUrl = `${environment.apiUrl}/api/v1/hotspots`;

  constructor(private http: HttpClient) { }

  geocodeAddress(address: string): Observable<GeocodeResponse> {
    return this.http.post<GeocodeResponse>(`${this.apiUrl}/geocode`, { address });
  }

  reverseGeocode(coordinates: Coordinates): Observable<GeocodeResponse> {
    return this.http.post<GeocodeResponse>(`${this.apiUrl}/reverse-geocode`, coordinates);
  }

  getHotspots(startDate: Date, endDate: Date): Observable<HotspotResponse[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.http.get<HotspotResponse[]>(this.hotspotUrl, { params });
  }

  analyzeHotspots(request: HotspotAnalysisRequest): Observable<HotspotResponse[]> {
    return this.http.post<HotspotResponse[]>(`${this.hotspotUrl}/analyze`, request);
  }
} 