import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationContextService } from '../../services/navigation-context.service';
import { MenuItem } from '../../models/navigation-context.model';
import { PropertyCapabilities } from '../../../models/property.model';
import { I18nService } from '../../../services/i18n.service';

type PathBuilder = (ids: { buildingId: number; unitId?: number; prefix: string; unitSegment: string }) => any[];
type MenuTemplate = Omit<MenuItem, 'link'> & { path: PathBuilder };

const MANAGEMENT_ONLY_ROLES = new Set(['BUILDING_MANAGER', 'BUILDING_SYNDIC', 'BUILDING_SECURITY']);

const BUILDING_MENU: MenuTemplate[] = [
  {
    id: 'overview',
    labelKey: 'building.menu.overview',
    fallbackLabel: 'Overview',
    exact: true,
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId]
  },
  {
    id: 'units',
    labelKey: 'building.menu.units',
    fallbackLabel: 'Units',
    capability: 'buildingUnits',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'units']
  },
  {
    id: 'amenities',
    labelKey: 'building.menu.amenities',
    fallbackLabel: 'Amenities',
    capability: 'amenities',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'amenities']
  },
  {
    id: 'maintenance',
    labelKey: 'building.menu.maintenance',
    fallbackLabel: 'Maintenance',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'maintenance']
  },
  {
    id: 'maintenance-history',
    labelKey: 'building.menu.maintenanceHistory',
    fallbackLabel: 'Maintenance History',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'maintenance-history']
  },
  {
    id: 'reservations',
    labelKey: 'building.menu.reservations',
    fallbackLabel: 'Reservations',
    capability: 'amenities',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'reservations']
  },
  {
    id: 'financials',
    labelKey: 'building.menu.financials',
    fallbackLabel: 'Financials',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'finances']
  },
  {
    id: 'documents',
    labelKey: 'building.menu.documents',
    fallbackLabel: 'Documents',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'documents']
  },
  {
    id: 'users',
    labelKey: 'building.menu.users',
    fallbackLabel: 'Users',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'users']
  },
  {
    id: 'settings',
    labelKey: 'building.menu.settings',
    fallbackLabel: 'Settings',
    path: ({ prefix, buildingId }) => ['/' + prefix, buildingId, 'edit']
  }
];

const UNIT_MENU: MenuTemplate[] = [
  {
    id: 'unit-overview',
    labelKey: 'unit.menu.overview',
    fallbackLabel: 'Unit Overview',
    exact: true,
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!]
  },
  {
    id: 'lease',
    labelKey: 'unit.menu.lease',
    fallbackLabel: 'Lease',
    capability: 'leaseManagement',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'leases']
  },
  {
    id: 'tenants',
    labelKey: 'unit.menu.tenants',
    fallbackLabel: 'Tenants',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'tenants']
  },
  {
    id: 'payments',
    labelKey: 'unit.menu.payments',
    fallbackLabel: 'Payments',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'payments']
  },
  {
    id: 'payment-history',
    labelKey: 'unit.menu.paymentHistory',
    fallbackLabel: 'Payment History',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'payment-history']
  },
  {
    id: 'unit-maintenance',
    labelKey: 'unit.menu.maintenance',
    fallbackLabel: 'Maintenance',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'maintenance']
  },
  {
    id: 'unit-private-maintenance',
    labelKey: 'unit.menu.privateMaintenance',
    fallbackLabel: 'Private Maintenance',
    visibility: 'unitTenancy',
    path: ({ prefix, buildingId, unitId, unitSegment }) => [
      '/' + prefix,
      buildingId,
      unitSegment,
      unitId!,
      'private-maintenance'
    ]
  },
  {
    id: 'unit-private-maintenance-history',
    labelKey: 'unit.menu.privateMaintenanceHistory',
    fallbackLabel: 'Private Maintenance History',
    visibility: 'unitTenancy',
    path: ({ prefix, buildingId, unitId, unitSegment }) => [
      '/' + prefix,
      buildingId,
      unitSegment,
      unitId!,
      'private-maintenance-history'
    ]
  },
  {
    id: 'unit-users',
    labelKey: 'unit.menu.users',
    fallbackLabel: 'Users',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'users']
  },
  {
    id: 'unit-documents',
    labelKey: 'unit.menu.documents',
    fallbackLabel: 'Documents',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'documents']
  },
  {
    id: 'unit-settings',
    labelKey: 'unit.menu.settings',
    fallbackLabel: 'Unit Settings',
    path: ({ prefix, buildingId, unitId, unitSegment }) => ['/' + prefix, buildingId, unitSegment, unitId!, 'settings']
  }
];

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="visible()"
      class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
      [attr.data-context]="contextKind()"
      [class.bg-primary-50]="contextKind() === 'unit'"
      [class.dark:bg-primary-950/30]="contextKind() === 'unit'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 overflow-x-auto py-2">
          <span class="mr-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {{ i18n.translate(contextLabelKey()) }}
          </span>

          <a
            *ngFor="let item of items(); trackBy: trackById"
            [routerLink]="item.link"
            routerLinkActive="bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            class="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {{ i18n.translate(item.labelKey) || item.fallbackLabel }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class TopMenuComponent {
  private readonly navContext = inject(NavigationContextService);
  readonly i18n = inject(I18nService);

  readonly visible = computed(() => this.navContext.isActive());
  readonly contextKind = computed(() => this.navContext.context().kind);
  readonly contextLabelKey = computed(() =>
    this.navContext.context().kind === 'unit' ? 'nav.context.unit' : 'nav.context.building'
  );

  readonly items = computed<MenuItem[]>(() => {
    const ctx = this.navContext.context();
    const capabilities = this.navContext.capabilities();
    const prefix = this.navContext.urlPrefix();
    // Legacy /property/:id routes use plural "units"; new /building/:id routes use singular "unit"
    const unitSegment = prefix === 'property' ? 'units' : 'unit';
    const roles = ctx.unit?.currentUserRoles ?? ctx.building?.currentUserRoles ?? [];
    const showUnitTenancyItems = !this.isManagementOnlyUser(roles);

    if (ctx.kind === 'unit' && ctx.unit) {
      return this.materialize(UNIT_MENU, capabilities, showUnitTenancyItems, {
        prefix,
        unitSegment,
        buildingId: ctx.unit.buildingId,
        unitId: ctx.unit.unitId
      });
    }
    if (ctx.kind === 'building' && ctx.building) {
      return this.materialize(BUILDING_MENU, capabilities, showUnitTenancyItems, {
        prefix,
        unitSegment,
        buildingId: ctx.building.buildingId
      });
    }
    return [];
  });

  trackById(_: number, item: MenuItem): string {
    return item.id;
  }

  private materialize(
    template: MenuTemplate[],
    capabilities: PropertyCapabilities,
    showUnitTenancyItems: boolean,
    ids: { prefix: string; unitSegment: string; buildingId: number; unitId?: number }
  ): MenuItem[] {
    return template
      .filter((entry) => !entry.capability || capabilities[entry.capability] !== false)
      .filter((entry) => entry.visibility !== 'unitTenancy' || showUnitTenancyItems)
      .map(({ path, ...rest }) => ({ ...rest, link: path(ids) }));
  }

  private isManagementOnlyUser(roles: string[]): boolean {
    if (!roles.length) {
      return false;
    }
    return roles.every((role) => MANAGEMENT_ONLY_ROLES.has(role));
  }
}
