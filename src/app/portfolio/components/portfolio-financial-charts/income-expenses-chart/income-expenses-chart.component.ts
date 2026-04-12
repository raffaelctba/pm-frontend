import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'app-income-expenses-chart',
  standalone: true,
  template: '<div class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">{{ i18n.translate(\'portfolio.financial.incomeExpensesChartPlaceholder\') }}</div>'
})
export class IncomeExpensesChartComponent {
  readonly i18n = inject(I18nService);
}

