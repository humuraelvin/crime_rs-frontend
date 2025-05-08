import { Directive, EventEmitter, Input, Output, HostListener, ElementRef, OnInit, Renderer2 } from '@angular/core';

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | '';
}

@Directive({
  selector: '[appSortable]',
  standalone: true
})
export class SortableDirective implements OnInit {
  @Input() appSortable: string = '';
  @Input() direction: 'asc' | 'desc' | '' = '';
  @Output() sort = new EventEmitter<SortEvent>();

  private static rotateDirection(direction: 'asc' | 'desc' | ''): 'asc' | 'desc' | '' {
    return direction === '' ? 'asc' : direction === 'asc' ? 'desc' : '';
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Add cursor pointer to make it obvious element is clickable
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
    this.renderer.addClass(this.el.nativeElement, 'user-select-none');
    // Add visual indicator of current sort state
    this.updateIcon();
  }

  @HostListener('click')
  onClick() {
    this.direction = SortableDirective.rotateDirection(this.direction);
    this.sort.emit({ column: this.appSortable, direction: this.direction });
    this.updateIcon();
  }

  private updateIcon() {
    // Clear old icons
    const existingIcons = this.el.nativeElement.querySelectorAll('.sort-icon');
    existingIcons.forEach((icon: Element) => {
      this.renderer.removeChild(this.el.nativeElement, icon);
    });

    // Create and add proper icon based on direction
    if (this.direction) {
      const iconSpan = this.renderer.createElement('span');
      this.renderer.addClass(iconSpan, 'sort-icon');
      this.renderer.addClass(iconSpan, 'ml-1');
      this.renderer.addClass(iconSpan, 'inline-block');
      
      const icon = this.direction === 'asc' ? '↑' : '↓';
      const text = this.renderer.createText(icon);
      this.renderer.appendChild(iconSpan, text);
      this.renderer.appendChild(this.el.nativeElement, iconSpan);
    }
  }
} 