import { Component, Input, inject } from '@angular/core';
import { PropertyDashboardVm } from '../../../shared/models/property-dashboard.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-property-tabs',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap gap-2">
        <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{{ i18n.translate('property.tabs.nav.overview') }}</span>
        <a [routerLink]="['/property', propertyId, 'units']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.units') }}</a>
        <a [routerLink]="['/property', propertyId, 'leases']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.leases') }}</a>
        <a [routerLink]="['/property', propertyId, 'finances']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.financials') }}</a>
        <a [routerLink]="['/property', propertyId, 'billing']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.billing') }}</a>
        <a [routerLink]="['/property', propertyId, 'work-orders']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.maintenance') }}</a>
        <a [routerLink]="['/property', propertyId, 'documents']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.documents') }}</a>
      </div>

      <div *ngIf="dashboard as vm" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.unitsTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.totalUnits }}</p>
            <p class="text-sm text-slate-600">{{ vm.overview.occupiedUnits }} {{ i18n.translate('property.tabs.summary.occupied') }} / {{ vm.overview.vacantUnits }} {{ i18n.translate('property.tabs.summary.vacant') }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.invoicesTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.totalInvoices }}</p>
            <p class="text-sm text-slate-600">{{ vm.overview.pendingInvoices }} {{ i18n.translate('property.tabs.summary.pending') }} / {{ vm.overview.overdueInvoices }} {{ i18n.translate('property.tabs.summary.overdue') }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.documentsTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.documentsCount }}</p>
            <p class="text-sm text-slate-600">{{ i18n.translate('property.tabs.summary.storedRecords') }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.openIssuesTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.incidentsOpen + vm.overview.workOrdersOpen + vm.overview.compliancePending }}</p>
            <p class="text-sm text-slate-600">{{ i18n.translate('property.tabs.summary.openIssuesDetail') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section class="rounded-xl border border-slate-200 p-4">
            <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.tabs.financialSnapshot.title') }}</h3>
            <div class="mt-2 space-y-1 text-sm text-slate-600">
              <p>{{ i18n.translate('property.tabs.financialSnapshot.pendingAmount') }}: {{ vm.overview.pendingAmount | currency }}</p>
              <p>{{ i18n.translate('property.tabs.financialSnapshot.paidAmount') }}: {{ vm.overview.paidAmount | currency }}</p>
              <p>{{ i18n.translate('property.tabs.financialSnapshot.overdueAmount') }}: {{ vm.overview.overdueAmount | currency }}</p>
            </div>
          </section>
          <section class="rounded-xl border border-slate-200 p-4">
            <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.tabs.recentActivity.title') }}</h3>
            <div class="mt-2 space-y-2 text-sm text-slate-600">
              @if (vm.recentActivity.length === 0) {
                <p>{{ i18n.translate('property.tabs.recentActivity.empty') }}</p>
              } @else {
                @for (item of vm.recentActivity; track item.type + item.timestamp + item.title) {
                  <div class="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p class="font-medium text-slate-900">{{ item.title }}</p>
                      <p class="text-xs uppercase tracking-wide text-slate-500">{{ getActivityTypeLabel(item.type) }} · {{ getActivityStatusLabel(item.status) }}</p>
                    </div>
                    <span class="text-xs text-slate-500">{{ item.timestamp | date:'short' }}</span>
                  </div>
                }
              }
            </div>
          </section>
        </div>
      </div>
    </div>
  `
})
export class PropertyTabsComponent {
  readonly i18n = inject(I18nService);

  @Input() propertyId: number | null = null;
  @Input() dashboard: PropertyDashboardVm | null = null;

  getActivityTypeLabel(type: string): string {
    const key = `portfolio.maintenance.activity.type.${this.normalizeValue(type)}`;
    const translated = this.i18n.translate(key);
    return translated === key ? type : translated;
  }

  getActivityStatusLabel(status: string): string {
    const key = `portfolio.maintenance.activity.status.${this.normalizeValue(status)}`;
    const translated = this.i18n.translate(key);
    return translated === key ? status : translated;
  }

  private normalizeValue(value: string): string {
    return value?.toLowerCase().trim().replace(/[_\s]+/g, '-') || '';
  }
}



