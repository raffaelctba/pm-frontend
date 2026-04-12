import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'app-upcoming-payments',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">{{ i18n.translate(\'property.placeholders.upcomingPayments\') }}</div>'
})
export class UpcomingPaymentsComponent {
  readonly i18n = inject(I18nService);
}

