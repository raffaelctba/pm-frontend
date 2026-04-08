import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioPropertyCardVm } from '../../../../shared/models/portfolio-dashboard.model';
import { I18nService } from '../../../../services/i18n.service';
import { getPropertyRoleLabelKey } from '../../../../shared/utils/property-role-i18n.util';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
      <div>
        <p class="font-medium text-slate-900">{{ property?.name }}</p>
        <p class="text-xs text-slate-500">{{ property?.propertyType }}</p>
        <p class="text-xs text-primary-700">
          {{ i18n.translate('property.role.label') }}: {{ i18n.translate(getRoleLabelKey(property?.currentUserRole)) }}
        </p>
      </div>
      <a [routerLink]="['/property', property?.id]" class="text-sm font-medium text-primary-600">Manage</a>
    </article>
  `
})
export class PropertyCardComponent {
  readonly i18n = inject(I18nService);
  @Input() property: PortfolioPropertyCardVm | null = null;

  getRoleLabelKey(role?: string): string {
    return getPropertyRoleLabelKey(role);
  }
}


