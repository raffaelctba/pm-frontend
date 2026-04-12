import { Component, Input, inject } from '@angular/core';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'app-total-properties-card',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">{{ i18n.translate(\'portfolio.cards.totalProperties\') }}</p><p class="text-2xl font-bold text-slate-900">{{ value }}</p></div>'
})
export class TotalPropertiesCardComponent {
  readonly i18n = inject(I18nService);
  @Input() value = 0;
}

