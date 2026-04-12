import { Component, Input, inject } from '@angular/core';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-portfolio-header',
  standalone: false,
  template: `
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900">{{ i18n.translate(titleKey) }}</h1>
      <p class="mt-1 text-sm text-slate-600">{{ i18n.translate(subtitleKey) }}</p>
    </div>
  `
})
export class PortfolioHeaderComponent {
  readonly i18n = inject(I18nService);

  @Input() titleKey = 'dashboard.globalTitle';
  @Input() subtitleKey = 'dashboard.globalSubtitle';
}


