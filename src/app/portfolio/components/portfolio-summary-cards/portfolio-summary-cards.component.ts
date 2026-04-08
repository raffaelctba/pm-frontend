import { Component, Input } from '@angular/core';
import { PortfolioStatsVm } from '../../../shared/models/portfolio-dashboard.model';

@Component({
  selector: 'app-portfolio-summary-cards',
  standalone: false,
  template: `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <app-total-properties-card [value]="stats?.totalProperties ?? 0"></app-total-properties-card>
      <app-total-income-card [value]="stats?.totalIncome ?? 0"></app-total-income-card>
      <app-occupancy-rate-card [value]="stats?.occupancyRate ?? 0"></app-occupancy-rate-card>
      <app-maintenance-overview-card [openRequests]="stats?.openMaintenanceRequests ?? 0"></app-maintenance-overview-card>
    </div>
  `
})
export class PortfolioSummaryCardsComponent {
  @Input() stats: PortfolioStatsVm | null = null;
}



