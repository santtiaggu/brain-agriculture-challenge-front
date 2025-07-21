import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgChartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  dashboardData: any;

  cropChart: ChartData<'pie', number[], string> = { labels: [], datasets: [] };
  stateChart: ChartData<'pie', number[], string> = { labels: [], datasets: [] };
  landUseChart: ChartData<'pie', number[], string> = { labels: [], datasets: [] };
  documentChart: ChartData<'pie', number[], string> = { labels: [], datasets: [] };
  cropSeasonCharts: { season: string; chart: ChartData<'pie', number[], string> }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('http://localhost:7001/api/dashboard').subscribe((data: any) => {
      this.dashboardData = data;

      this.cropChart = {
        labels: Object.keys(data.by_crop),
        datasets: [{ data: Object.values(data.by_crop) }]
      };

      this.stateChart = {
        labels: Object.keys(data.by_state),
        datasets: [{ data: Object.values(data.by_state) }]
      };

      this.landUseChart = {
        labels: ['Agricultural', 'Vegetation'],
        datasets: [{ data: [data.land_use.agricultural, data.land_use.vegetation] }]
      };

      this.documentChart = {
        labels: Object.keys(data.by_document_type),
        datasets: [{ data: Object.values(data.by_document_type) }]
      };

      this.cropSeasonCharts = Object.entries(data.by_crop_season).map(
        ([season, crops]: [string, any]) => ({
          season,
          chart: {
            labels: Object.keys(crops),
            datasets: [{ data: Object.values(crops) }]
          }
        })
      );
    });
  }
}
