import { Component, Input, inject } from '@angular/core';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'app-occupancy-card',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">{{ i18n.translate(\'property.summaryCards.occupancy\') }}</p><p class="text-lg font-semibold text-slate-900">{{ value }}%</p></div>'
})
export class OccupancyCardComponent {
  readonly i18n = inject(I18nService);
  @Input() value = 0;
}

