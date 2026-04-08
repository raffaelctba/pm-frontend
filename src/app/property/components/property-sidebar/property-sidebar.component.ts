import { Component, Input, inject } from '@angular/core';
import { PropertySidebarVm } from '../../../shared/models/property-dashboard.model';
import { I18nService } from '../../../services/i18n.service';
import { getPropertyRoleLabelKey } from '../../../shared/utils/property-role-i18n.util';

@Component({
  selector: 'app-property-sidebar',
  standalone: false,
  template: `
    <aside class="space-y-4">

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900">Location</h3>
        <p class="mt-2 text-sm text-slate-600">{{ sidebar?.locationLabel || '-' }}</p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.sidebar.linkedUsers') }}</h3>
        @if ((sidebar?.linkedUsers?.length ?? 0) === 0) {
          <p class="mt-2 text-sm text-slate-500">{{ i18n.translate('property.sidebar.noLinkedUsers') }}</p>
        } @else {
          <div class="mt-3 space-y-2">
            @for (member of sidebar?.linkedUsers ?? []; track member.userId + '-' + member.role) {
              <div class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p class="text-sm font-medium text-slate-900">{{ member.fullName }}</p>
                <p class="text-xs text-slate-600">{{ member.email }}</p>
                <p class="text-xs text-primary-700">{{ i18n.translate(getRoleLabelKey(member.role)) }}</p>
              </div>
            }
          </div>
        }
      </section>
    </aside>
  `
})
export class PropertySidebarComponent {
  readonly i18n = inject(I18nService);
  @Input() sidebar: PropertySidebarVm | null = null;

  getRoleLabelKey(role?: string): string {
    return getPropertyRoleLabelKey(role);
  }
}



