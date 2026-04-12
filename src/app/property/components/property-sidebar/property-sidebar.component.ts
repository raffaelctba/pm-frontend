import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PropertySidebarVm } from '../../../shared/models/property-dashboard.model';
import { I18nService } from '../../../services/i18n.service';
import { getPropertyRoleLabelKey } from '../../../shared/utils/property-role-i18n.util';
import { DashboardContextService } from '../../../services/dashboard-context.service';

@Component({
  selector: 'app-property-sidebar',
  standalone: false,
  template: `
    <aside class="space-y-4">

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.sidebar.location') }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ sidebar?.locationLabel || '-' }}</p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.sidebar.linkedUsers') }}</h3>
        @if ((sidebar?.linkedUsers?.length ?? 0) === 0) {
          <p class="mt-2 text-sm text-slate-500">{{ i18n.translate('property.sidebar.noLinkedUsers') }}</p>
        } @else {
          <div class="mt-3 space-y-2">
            @for (member of sidebar?.linkedUsers ?? []; track member.userId + '-' + member.role) {
              <div
                class="cursor-pointer rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition hover:border-slate-200"
                (click)="canStartChat() && startChatWithMember(member.userId)"
              >
                <p class="text-sm font-medium text-slate-900">{{ member.fullName }}</p>
                <p class="text-xs text-slate-600">{{ member.email }}</p>
                <p class="text-xs text-primary-700">{{ i18n.translate(getRoleLabelKey(member.role)) }}</p>
                @if (canStartChat()) {
                  <div class="mt-2">
                    <button
                      type="button"
                      class="rounded-md border border-primary-200 bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
                      (click)="$event.stopPropagation(); startChatWithMember(member.userId)"
                    >
                      {{ i18n.translate('nav.chat') }}
                    </button>
                  </div>
                }
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
  private readonly router = inject(Router);
  private readonly dashboardContext = inject(DashboardContextService);
  @Input() sidebar: PropertySidebarVm | null = null;

  private readonly propertyChatRoles = new Set<string>([
    'PROPERTY_OWNER',
    'BUILDING_SYNDIC',
    'BUILDING_MANAGER',
    'BUILDING_SECURITY'
  ]);

  getRoleLabelKey(role?: string): string {
    return getPropertyRoleLabelKey(role);
  }


  canStartChat(): boolean {
    const currentUserRole = this.dashboardContext.property()?.currentUserRole;
    return this.isAllowedChatRole(currentUserRole);
  }

  startChatWithMember(memberId: number): void {
    const propertyId = this.dashboardContext.propertyId();
    if (!propertyId) {
      return;
    }

    void this.router.navigate(['/chat'], {
      queryParams: {
        property: propertyId,
        member: memberId
      }
    });
  }

  private isAllowedChatRole(role?: string): boolean {
    return !!role && this.propertyChatRoles.has(role);
  }
}



