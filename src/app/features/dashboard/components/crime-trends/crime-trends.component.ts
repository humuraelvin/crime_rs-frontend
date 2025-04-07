import { Component, Input, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-crime-trends',
  templateUrl: './crime-trends.component.html',
  styleUrls: ['./crime-trends.component.css']
})
export class CrimeTrendsComponent implements OnInit {
  @Input() data: any;
  private chart: Chart | undefined;

  ngOnInit(): void {
    this.createChart();
  }

  private createChart(): void {
    const ctx = document.getElementById('crimeTrendsChart') as HTMLCanvasElement;
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: this.data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monthly Crime Reports'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
} 