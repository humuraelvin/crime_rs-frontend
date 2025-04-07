import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-statistics-card',
  templateUrl: './statistics-card.component.html',
  styleUrls: ['./statistics-card.component.css']
})
export class StatisticsCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() icon: string = '';
  @Input() color: string = '';
} 