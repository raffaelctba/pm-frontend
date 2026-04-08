import { Component, Input } from '@angular/core';
import { PortfolioStatsVm } from '../../../shared/models/portfolio-dashboard.model';

@Component({
  selector: 'app-portfolio-financial-charts',
  standalone: false,
  template: `
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2" *ngIf="stats as s">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <h3 class="text-sm font-semibold text-slate-900">Income vs invoices</h3>
        <p class="mt-2 text-sm text-slate-600">Estimated monthly income: {{ s.totalIncome | currency }}</p>
        <p class="text-sm text-slate-600">Outstanding invoices: {{ s.outstandingInvoices }}</p>
        <p class="text-sm text-slate-600">Paid invoices: {{ s.paidInvoices }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <h3 class="text-sm font-semibold text-slate-900">Cashflow trend</h3>
        <p class="mt-2 text-sm text-slate-600">Live chart placeholder with API-backed counters.</p>
        <app-income-expenses-chart></app-income-expenses-chart>
        <div class="mt-2">
          <app-cashflow-trend-chart></app-cashflow-trend-chart>
        </div>
      </div>
    </div>
  `
})
export class PortfolioFinancialChartsComponent {
  @Input() stats: PortfolioStatsVm | null = null;
}



