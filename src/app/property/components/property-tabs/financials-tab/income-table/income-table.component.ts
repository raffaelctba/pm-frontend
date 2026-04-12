import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../../services/i18n.service';

@Component({
  selector: 'app-income-table',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">{{ i18n.translate(\'property.placeholders.incomeTable\') }}</div>'
})
export class IncomeTableComponent {
  readonly i18n = inject(I18nService);
}

