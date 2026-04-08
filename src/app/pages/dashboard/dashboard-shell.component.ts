import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DashboardContextService } from '../../services/dashboard-context.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <section class="px-4 py-4">
      <div class="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ i18n.translate('dashboard.context') }}
        </p>
        <div class="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 class="text-2xl font-bold text-slate-900">{{ contextTitle() }}</h1>
          <a
            *ngIf="context.isProperty()"
            routerLink="/dashboard"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {{ i18n.translate('dashboard.switchToPortfolio') }}
          </a>
        </div>
      </div>

      <router-outlet></router-outlet>
    </section>
  `
})
export class DashboardShellComponent {
  readonly context = inject(DashboardContextService);
  readonly i18n = inject(I18nService);

  readonly contextTitle = computed(() => {
    if (this.context.isGlobal()) {
      return this.i18n.translate('dashboard.globalTitle');
    }

    const propertyName = this.context.property()?.name;
    if (propertyName) {
      return `${this.i18n.translate('dashboard.propertyTitle')}: ${propertyName}`;
    }

    return this.i18n.translate('dashboard.propertyTitle');
  });
}

