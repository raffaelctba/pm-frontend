import { Component, Input, inject } from '@angular/core';
import { PortfolioStatsVm } from '../../../shared/models/portfolio-dashboard.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-portfolio-financial-charts',
  standalone: false,
  template: `
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2" *ngIf="stats as s">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('portfolio.financial.incomeVsInvoicesTitle') }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ i18n.translate('portfolio.financial.estimatedMonthlyIncome') }}: {{ s.totalIncome | currency }}</p>
        <p class="text-sm text-slate-600">{{ i18n.translate('portfolio.financial.outstandingInvoices') }}: {{ s.outstandingInvoices }}</p>
        <p class="text-sm text-slate-600">{{ i18n.translate('portfolio.financial.paidInvoices') }}: {{ s.paidInvoices }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('portfolio.financial.cashflowTrendTitle') }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ i18n.translate('portfolio.financial.liveChartPlaceholder') }}</p>
        <app-income-expenses-chart></app-income-expenses-chart>
        <div class="mt-2">
          <app-cashflow-trend-chart></app-cashflow-trend-chart>
        </div>
      </div>
    </div>
  `
})
export class PortfolioFinancialChartsComponent {
  readonly i18n = inject(I18nService);
  @Input() stats: PortfolioStatsVm | null = null;
}



