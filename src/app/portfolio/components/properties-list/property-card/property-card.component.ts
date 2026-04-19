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
    <article class="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
      <img class="h-16 w-16 rounded-lg object-cover bg-slate-100" [src]="getImageSrc()" [alt]="property?.name || 'Property'" loading="lazy" (error)="onImageError($event)" />
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-slate-900">{{ property?.name }}</p>
        <p class="text-xs text-slate-500">{{ property?.propertyType }}</p>
        <p class="text-xs text-primary-700">
          {{ i18n.translate('property.role.label') }}: {{ i18n.translate(getRoleLabelKey(property?.currentUserRole)) }}
        </p>
      </div>
      <a [routerLink]="['/property', property?.id]" class="text-sm font-medium text-primary-600">{{ i18n.translate('portfolio.properties.manageAction') }}</a>
    </article>
  `
})
export class PropertyCardComponent {
  readonly i18n = inject(I18nService);
  @Input() property: PortfolioPropertyCardVm | null = null;

  getRoleLabelKey(role?: string): string {
    return getPropertyRoleLabelKey(role);
  }

  getImageSrc(): string {
    const demoImages = [
      '/assets/demo-property-images/property-1.svg',
      '/assets/demo-property-images/property-2.svg',
      '/assets/demo-property-images/property-3.svg'
    ];

    return this.property?.imageUrl || demoImages[(this.property?.id ?? 0) % demoImages.length];
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = '/assets/demo-property-images/property-1.svg';
    }
  }
}


