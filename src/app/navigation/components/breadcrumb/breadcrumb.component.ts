import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavigationContextService } from '../../services/navigation-context.service';
import { BreadcrumbItem } from '../../models/navigation-context.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      *ngIf="visible()"
      aria-label="Breadcrumb"
      class="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/60"
    >
      <div class="max-w-7xl mx-auto flex flex-wrap items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
        <ol class="flex flex-1 flex-wrap items-center gap-1 text-sm">
          <li
            *ngFor="let crumb of items(); let last = last; trackBy: trackByLabel"
            class="flex items-center gap-1"
          >
            <a
              *ngIf="crumb.link && !crumb.current; else staticCrumb"
              [routerLink]="crumb.link"
              class="font-medium text-primary-700 hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-200"
            >
              {{ crumb.label }}
            </a>
            <ng-template #staticCrumb>
              <span
                class="font-semibold"
                [class.text-slate-900]="crumb.current"
                [class.dark:text-slate-100]="crumb.current"
                [class.text-slate-600]="!crumb.current"
                [class.dark:text-slate-300]="!crumb.current"
                [attr.aria-current]="crumb.current ? 'page' : null"
              >
                {{ crumb.label }}
              </span>
            </ng-template>

            <span
              *ngIf="!last"
              class="px-1 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            >
              &gt;
            </span>
          </li>
        </ol>

        <a
          *ngIf="backLink() as link"
          [routerLink]="link"
          class="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">←</span>
          {{ i18n.translate('nav.backToBuilding') }}
        </a>
      </div>
    </nav>
  `
})
export class BreadcrumbComponent {
  private readonly navContext = inject(NavigationContextService);
  readonly i18n = inject(I18nService);

  readonly visible = computed(() => this.navContext.isActive());

  readonly items = computed<BreadcrumbItem[]>(() => {
    const ctx = this.navContext.context();
    const prefix = this.navContext.urlPrefix();
    if (ctx.kind === 'unit' && ctx.unit) {
      return [
        {
          label: ctx.unit.buildingName,
          link: ['/' + prefix, ctx.unit.buildingId]
        },
        {
          label: `Unit ${ctx.unit.unitNumber}`,
          current: true
        }
      ];
    }
    if (ctx.kind === 'building' && ctx.building) {
      return [{ label: ctx.building.buildingName, current: true }];
    }
    return [];
  });

  readonly backLink = computed<any[] | null>(() => {
    const ctx = this.navContext.context();
    if (ctx.kind === 'unit' && ctx.unit) {
      return ['/' + this.navContext.urlPrefix(), ctx.unit.buildingId];
    }
    return null;
  });

  trackByLabel(_: number, item: BreadcrumbItem): string {
    return item.label;
  }
}
