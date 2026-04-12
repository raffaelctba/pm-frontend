import { Component, Input, inject } from '@angular/core';
import { PropertyHeaderVm } from '../../../shared/models/property-dashboard.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-property-header',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.header.breadcrumbPrefix') }} {{ header?.breadcrumbLabel || i18n.translate('property.header.propertyFallback') }}</p>
      <p class="mt-1 text-xs uppercase tracking-wide text-slate-500">{{ header?.typeLabel || i18n.translate('property.header.dashboardFallback') }}</p>
      <h1 class="mt-1 text-2xl font-bold text-slate-900">{{ header?.name || i18n.translate('property.header.propertyFallback') }}</h1>
      <p class="mt-1 text-sm text-slate-600">{{ header?.subtitle || i18n.translate('property.header.subtitleFallback') }}</p>
      <p class="mt-2 text-xs text-slate-500">
        <span class="font-medium text-slate-700">{{ i18n.translate('property.header.status') }}:</span> {{ header?.statusLabel || '-' }}
      </p>
      <p class="mt-1 text-xs text-slate-500">{{ header?.addressLabel || '-' }}</p>
      <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        {{ i18n.translate('property.header.workspaceActionsHint') }}
      </div>
    </div>
  `
})
export class PropertyHeaderComponent {
  readonly i18n = inject(I18nService);
  @Input() header: PropertyHeaderVm | null = null;
}



