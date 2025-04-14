import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  constructor() {}

  // This is a simple implementation that always returns true for testing
  // In a real implementation, this would show a dialog and return the user's choice
  openConfirmDialog(title: string, message: string): Observable<boolean> {
    // For now, simulate a confirmation dialog with a window.confirm
    return of(window.confirm(`${title}: ${message}`));
  }
} 