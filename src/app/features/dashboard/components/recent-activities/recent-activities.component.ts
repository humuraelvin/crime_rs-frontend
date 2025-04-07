import { Component, Input } from '@angular/core';

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  location: string;
}

@Component({
  selector: 'app-recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.css']
})
export class RecentActivitiesComponent {
  @Input() activities: Activity[] = [];

  getActivityIcon(type: string): string {
    switch (type) {
      case 'New Report':
        return 'fas fa-file-alt text-blue-500';
      case 'Case Update':
        return 'fas fa-sync-alt text-yellow-500';
      case 'Hotspot Identified':
        return 'fas fa-map-marker-alt text-red-500';
      default:
        return 'fas fa-info-circle text-gray-500';
    }
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }
} 