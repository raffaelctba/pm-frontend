import { Component, Input, inject } from '@angular/core';
import { PortfolioPropertyCardVm } from '../../../shared/models/portfolio-dashboard.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-properties-list',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">{{ i18n.translate('portfolio.properties.title') }}</h2>
        <a routerLink="/properties/new" class="btn btn-primary text-sm px-4 py-2">
          + {{ i18n.translate('dashboard.newProperty') }}
        </a>
      </div>
      <div class="space-y-3" *ngIf="properties.length; else emptyState">
        <app-property-card *ngFor="let property of properties" [property]="property"></app-property-card>
      </div>
      <ng-template #emptyState>
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <p class="text-sm text-slate-500 mb-4">{{ i18n.translate('portfolio.properties.empty') }}</p>
          <a routerLink="/properties/new" class="btn btn-primary">
            {{ i18n.translate('dashboard.registerFirstProperty') }}
          </a>
        </div>
      </ng-template>
    </div>
  `
})
export class PropertiesListComponent {
  readonly i18n = inject(I18nService);
  @Input() properties: PortfolioPropertyCardVm[] = [];
}




