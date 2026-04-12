import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'app-maintenance-table',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">{{ i18n.translate(\'portfolio.maintenance.tablePlaceholder\') }}</div>'
})
export class MaintenanceTableComponent {
  readonly i18n = inject(I18nService);
}

