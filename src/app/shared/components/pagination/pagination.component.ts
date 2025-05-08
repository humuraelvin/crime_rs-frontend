import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          (click)="onPageChange(currentPage - 1)"
          [disabled]="currentPage === 0"
          [class.opacity-50]="currentPage === 0"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          {{ 'pagination.previous' | translate }}
        </button>
        <button
          (click)="onPageChange(currentPage + 1)"
          [disabled]="currentPage >= totalPages - 1"
          [class.opacity-50]="currentPage >= totalPages - 1"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          {{ 'pagination.next' | translate }}
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            {{ 'pagination.showing' | translate }} <span class="font-medium">{{ startItem }}</span> 
            {{ 'pagination.to' | translate }} <span class="font-medium">{{ endItem }}</span> 
            {{ 'pagination.of' | translate }} <span class="font-medium">{{ totalItems }}</span> 
            {{ 'pagination.results' | translate }}
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              (click)="onPageChange(currentPage - 1)"
              [disabled]="currentPage === 0"
              [class.opacity-50]="currentPage === 0"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
              <span class="sr-only">{{ 'pagination.previous' | translate }}</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <ng-container *ngFor="let page of visiblePages">
              <button
                *ngIf="page !== -1"
                (click)="onPageChange(page)"
                [class.bg-blue-50]="page === currentPage"
                [class.text-blue-600]="page === currentPage"
                [class.text-gray-900]="page !== currentPage"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                {{ page + 1 }}
              </button>
              <span
                *ngIf="page === -1"
                class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                ...
              </span>
            </ng-container>

            <button
              (click)="onPageChange(currentPage + 1)"
              [disabled]="currentPage >= totalPages - 1"
              [class.opacity-50]="currentPage >= totalPages - 1"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
              <span class="sr-only">{{ 'pagination.next' | translate }}</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
      
      <div class="flex items-center ml-4">
        <select 
          class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          [(ngModel)]="pageSize"
          (change)="onPageSizeChange()">
          <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
        </select>
        <span class="ml-2 text-sm text-gray-700">{{ 'pagination.items_per_page' | translate }}</span>
      </div>
    </div>
  `,
  styles: []
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages: number = 0;
  startItem: number = 0;
  endItem: number = 0;
  visiblePages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.startItem = this.currentPage * this.pageSize + 1;
    this.endItem = Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);

    // Calculate visible page numbers
    this.visiblePages = this.getVisiblePages();
  }

  getVisiblePages(): number[] {
    const visiblePages: number[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    // Always show first page
    visiblePages.push(0);

    // If there's a gap after first page, add ellipsis
    if (currentPage > 3) {
      visiblePages.push(-1); // -1 indicates ellipsis
    }

    // Pages around current page
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
      visiblePages.push(i);
    }

    // If there's a gap before last page, add ellipsis
    if (currentPage < totalPages - 4) {
      visiblePages.push(-1); // -1 indicates ellipsis
    }

    // Always show last page if there are at least 2 pages
    if (totalPages > 1) {
      visiblePages.push(totalPages - 1);
    }

    return visiblePages;
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(): void {
    this.pageSizeChange.emit(this.pageSize);
  }
} 