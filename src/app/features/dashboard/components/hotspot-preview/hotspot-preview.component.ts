import { Component, Input } from '@angular/core';

interface Hotspot {
  id: number;
  name: string;
  severity: string;
  crimeCount: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-hotspot-preview',
  templateUrl: './hotspot-preview.component.html',
  styleUrls: ['./hotspot-preview.component.css']
})
export class HotspotPreviewComponent {
  @Input() hotspots: Hotspot[] = [];

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 