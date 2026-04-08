import { Component, Input } from '@angular/core';
import { PropertyHeaderVm } from '../../../shared/models/property-dashboard.model';

@Component({
  selector: 'app-property-header',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p class="text-xs uppercase tracking-wide text-slate-500">Portfolio / Property / {{ header?.breadcrumbLabel || 'Property' }}</p>
      <p class="mt-1 text-xs uppercase tracking-wide text-slate-500">{{ header?.typeLabel || 'Property dashboard' }}</p>
      <h1 class="mt-1 text-2xl font-bold text-slate-900">{{ header?.name || 'Property' }}</h1>
      <p class="mt-1 text-sm text-slate-600">{{ header?.subtitle || 'Focused context for this property only.' }}</p>
      <p class="mt-2 text-xs text-slate-500">
        <span class="font-medium text-slate-700">Status:</span> {{ header?.statusLabel || '-' }}
      </p>
      <p class="mt-1 text-xs text-slate-500">{{ header?.addressLabel || '-' }}</p>
      <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Workspace actions are available in the tabs below.
      </div>
    </div>
  `
})
export class PropertyHeaderComponent {
  @Input() header: PropertyHeaderVm | null = null;
}



