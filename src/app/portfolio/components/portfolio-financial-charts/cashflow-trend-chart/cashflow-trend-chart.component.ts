import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'app-cashflow-trend-chart',
  standalone: true,
  template: '<div class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">{{ i18n.translate(\'portfolio.financial.cashflowTrendChartPlaceholder\') }}</div>'
})
export class CashflowTrendChartComponent {
  readonly i18n = inject(I18nService);
}

