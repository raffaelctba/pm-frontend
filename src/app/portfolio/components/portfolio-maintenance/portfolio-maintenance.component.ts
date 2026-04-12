import { Component, Input, inject } from '@angular/core';
import { PortfolioActivityVm, PortfolioStatsVm } from '../../../shared/models/portfolio-dashboard.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-portfolio-maintenance',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900">{{ i18n.translate('portfolio.maintenance.overviewTitle') }}</h2>
      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3" *ngIf="stats as s">
        <div class="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
          {{ i18n.translate('portfolio.maintenance.criticalIncidents') }}: <span class="font-semibold">{{ s.criticalIncidents }}</span>
        </div>
        <div class="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
          {{ i18n.translate('portfolio.maintenance.pendingWorkOrders') }}: <span class="font-semibold">{{ s.pendingWorkOrders }}</span>
        </div>
        <div class="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
          {{ i18n.translate('portfolio.maintenance.pendingCompliance') }}: <span class="font-semibold">{{ s.pendingCompliance }}</span>
        </div>
      </div>
      <div class="mt-4 space-y-3">
        <app-maintenance-status-filters></app-maintenance-status-filters>
        <app-maintenance-table></app-maintenance-table>
      </div>

      <div class="mt-4" *ngIf="recentActivity.length">
        <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('portfolio.maintenance.recentActivity') }}</h3>
        <div class="mt-2 space-y-2">
          <div *ngFor="let item of recentActivity" class="rounded-lg border border-slate-100 px-3 py-2 text-sm">
            <div class="font-medium text-slate-900">{{ item.title }}</div>
            <div class="text-xs uppercase text-slate-500">
              {{ getActivityTypeLabel(item.type) }} · {{ getActivityStatusLabel(item.status) }} · {{ item.timestamp | date:'short' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PortfolioMaintenanceComponent {
  readonly i18n = inject(I18nService);

  @Input() stats: PortfolioStatsVm | null = null;
  @Input() recentActivity: PortfolioActivityVm[] = [];

  getActivityTypeLabel(type: PortfolioActivityVm['type']): string {
    return this.translateKnownOrRaw('portfolio.maintenance.activity.type.', type);
  }

  getActivityStatusLabel(status: string): string {
    return this.translateKnownOrRaw('portfolio.maintenance.activity.status.', status);
  }

  private translateKnownOrRaw(baseKey: string, rawValue: string): string {
    const normalized = rawValue?.toLowerCase().trim().replace(/[_\s]+/g, '-');
    if (!normalized) {
      return rawValue;
    }

    const key = `${baseKey}${normalized}`;
    const translated = this.i18n.translate(key);
    return translated === key ? rawValue : translated;
  }
}



