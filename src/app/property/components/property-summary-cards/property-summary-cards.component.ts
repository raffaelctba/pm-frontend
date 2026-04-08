import { Component, Input } from '@angular/core';
import { PropertySummaryCardsVm } from '../../../shared/models/property-dashboard.model';

@Component({
  selector: 'app-property-summary-cards',
  standalone: false,
  template: `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <app-valuation-card [value]="summary?.valuationLabel ?? '-'"></app-valuation-card>
      <app-monthly-income-card [value]="summary?.monthlyIncomeLabel ?? '-'"></app-monthly-income-card>
      <app-occupancy-card [value]="summary?.occupancyRate ?? 0"></app-occupancy-card>
      <app-maintenance-status-card [value]="summary?.maintenanceStatusLabel ?? '-'"></app-maintenance-status-card>
    </div>
  `
})
export class PropertySummaryCardsComponent {
  @Input() summary: PropertySummaryCardsVm | null = null;
}



