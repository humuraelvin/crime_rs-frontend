import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LocationService, HotspotResponse } from '../../core/services/location.service';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [DatePipe]
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 12;
  markers: google.maps.MarkerOptions[] = [];
  hotspots: HotspotResponse[] = [];
  selectedHotspot: HotspotResponse | null = null;
  loading = false;
  error: string | null = null;

  // Date range for analysis
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  endDate: Date = new Date();
  minClusterSize = 3;

  constructor(
    private locationService: LocationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.loadHotspots();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location if geolocation fails
          this.center = { lat: 0, lng: 0 };
          this.loadHotspots();
        }
      );
    } else {
      this.loadHotspots();
    }
  }

  ngAfterViewInit() {
    // Additional map initialization if needed
  }

  loadHotspots() {
    this.loading = true;
    this.error = null;

    this.locationService.getHotspots(this.startDate, this.endDate).subscribe({
      next: (hotspots) => {
        this.hotspots = hotspots;
        this.updateMarkers();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading hotspots:', err);
        this.error = 'Failed to load crime hotspots. Please try again later.';
        this.loading = false;
      }
    });
  }

  updateMarkers() {
    this.markers = this.hotspots.map(hotspot => ({
      position: {
        lat: hotspot.latitude,
        lng: hotspot.longitude
      },
      title: `Crime Hotspot: ${hotspot.dominantCrimeType}`,
      options: {
        icon: this.getMarkerIcon(hotspot.averageSeverity)
      }
    }));
  }

  getMarkerIcon(severity: number): google.maps.Symbol {
    // Color scale from green (low severity) to red (high severity)
    const hue = Math.round((1 - severity / 100) * 120); // 120 is green, 0 is red
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10 + (severity / 10), // Size based on severity
      fillColor: `hsl(${hue}, 100%, 50%)`,
      fillOpacity: 0.7,
      strokeColor: '#000',
      strokeWeight: 1
    };
  }

  openInfoWindow(marker: MapMarker, hotspot: HotspotResponse) {
    this.selectedHotspot = hotspot;
    this.infoWindow.open(marker);
  }

  getCrimeTypeDistribution(hotspot: HotspotResponse): string {
    return Object.entries(hotspot.crimeTypeCounts)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  }

  analyzeHotspots() {
    const request = {
      startDate: this.startDate,
      endDate: this.endDate,
      minClusterSize: this.minClusterSize
    };

    this.loading = true;
    this.error = null;

    this.locationService.analyzeHotspots(request).subscribe({
      next: (hotspots) => {
        this.hotspots = hotspots;
        this.updateMarkers();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error analyzing hotspots:', err);
        this.error = 'Failed to analyze crime hotspots. Please try again later.';
        this.loading = false;
      }
    });
  }
} 