import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyHeaderVm } from '../../../shared/models/property-dashboard.model';
import { I18nService } from '../../../services/i18n.service';
import { getPropertyRoleLabelKey } from '../../../shared/utils/property-role-i18n.util';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';

@Component({
  selector: 'app-property-header',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex-1">
          <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.header.breadcrumbPrefix') }} {{ header?.breadcrumbLabel || i18n.translate('property.header.propertyFallback') }}</p>
          <p class="mt-1 text-xs uppercase tracking-wide text-slate-500">{{ header?.typeLabel || i18n.translate('property.header.dashboardFallback') }}</p>
          <h1 class="mt-1 text-2xl font-bold text-slate-900">{{ header?.name || i18n.translate('property.header.propertyFallback') }}</h1>
          <p class="mt-1 text-sm text-slate-600">{{ header?.subtitle || i18n.translate('property.header.subtitleFallback') }}</p>
          
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1">
             <p class="text-xs text-slate-500">
               <span class="font-medium text-slate-700">{{ i18n.translate('property.header.status') }}:</span> {{ header?.statusLabel || '-' }}
             </p>
             <p class="text-xs text-slate-500">
               <span class="font-medium text-slate-700">{{ i18n.translate('property.role.label') }}:</span>
               <span class="ml-1 inline-flex flex-wrap gap-1">
                 @for (role of getUserRoles(); track role) {
                   <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                     {{ i18n.translate(getPropertyRoleLabelKey(role)) }}
                   </span>
                 }
               </span>
             </p>
          </div>
          <p class="mt-1 text-xs text-slate-500">{{ header?.addressLabel || '-' }}</p>
        </div>

        @if (header?.id && canManageOverviewActions()) {
          <div class="flex flex-wrap gap-2 sm:mt-0">
            <a [routerLink]="['/property', header?.id, 'edit']" class="btn btn-primary text-xs flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">edit</span>
              {{ i18n.translate('property.workspace.editProperty') }}
            </a>
            <a [routerLink]="['/property', header?.id, 'units']" class="btn btn-secondary text-xs flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">domain</span>
              {{ i18n.translate('property.tabs.quickActions.manageUnits') }}
            </a>
          </div>
        }
      </div>
      
      <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        {{ i18n.translate('property.header.workspaceActionsHint') }}
      </div>
    </div>
  `
})
export class PropertyHeaderComponent {
  readonly i18n = inject(I18nService);
  @Input() header: PropertyHeaderVm | null = null;

  getUserRoles(): string[] {
    if (!this.header?.userRolesLabel) {
      return [];
    }
    return this.header.userRolesLabel
      .split(', ')
        .filter((role: string) => role && role !== 'No role');
  }

  getPropertyRoleLabelKey(role: string): string {
    return getPropertyRoleLabelKey(role);
  }

  getUserPermissionKeys(): string[] {
    const permissions = this.header?.userPermissions ?? [];
    return Array.from(new Set(permissions.filter((permission: string) => !!permission)));
  }

  canManageOverviewActions(): boolean {
    if (this.getUserRoles().some((role: string) => canManageBuildingOperations(role))) {
      return true;
    }

    const normalizedPermissions = this.getUserPermissionKeys().map((permission: string) => permission.toUpperCase());
    return normalizedPermissions.some((permission: string) =>
      permission.includes('PROPERTY_EDIT')
      || permission.includes('PROPERTY_MANAGE')
      || permission.includes('BUILDING_MANAGE')
      || permission.includes('BUILDING_WRITE')
      || permission.includes('UNIT_MANAGE')
      || permission.includes('UNIT_WRITE')
    );
  }
}
