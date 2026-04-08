import { Component, Input } from '@angular/core';
import { PropertyDashboardVm } from '../../../shared/models/property-dashboard.model';
import { canManageBuildingOperations, canManagePrivatePropertyOperations } from '../../../shared/utils/property-permissions.util';

@Component({
  selector: 'app-property-tabs',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap gap-2">
        <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Overview</span>
        @if (showBuildingTabs()) {
          @if (canManageBuildingTabs()) {
            <a [routerLink]="['/property', propertyId, 'units']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">Units</a>
          }
          @if (canViewFinancials()) {
            <a [routerLink]="['/property', propertyId, 'finances']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">Financials</a>
          }
          <a [routerLink]="['/property', propertyId, 'work-orders']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">Maintenance</a>
          @if (canManageBuildingTabs()) {
            <a [routerLink]="['/property', propertyId, 'compliance']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">Compliance</a>
          }
          <a [routerLink]="['/property', propertyId, 'documents']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">Documents</a>
        }

        @if (showPrivateOwnerTabs()) {
          <a [routerLink]="['/property', propertyId, 'finances']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">Financials</a>
          <a [routerLink]="['/property', propertyId, 'documents']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">Documents</a>
        }
      </div>

      <div *ngIf="dashboard as vm" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Units</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.totalUnits }}</p>
            <p class="text-sm text-slate-600">{{ vm.overview.occupiedUnits }} occupied / {{ vm.overview.vacantUnits }} vacant</p>
          </div>
          @if (canViewFinancials()) {
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Invoices</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.totalInvoices }}</p>
              <p class="text-sm text-slate-600">{{ vm.overview.pendingInvoices }} pending / {{ vm.overview.overdueInvoices }} overdue</p>
            </div>
          }
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Documents</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.documentsCount }}</p>
            <p class="text-sm text-slate-600">Stored records</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Open issues</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.incidentsOpen + vm.overview.workOrdersOpen + vm.overview.compliancePending }}</p>
            <p class="text-sm text-slate-600">Incidents, work orders and compliance</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          @if (canViewFinancials()) {
            <section class="rounded-xl border border-slate-200 p-4">
              <h3 class="text-sm font-semibold text-slate-900">Financial snapshot</h3>
              <div class="mt-2 space-y-1 text-sm text-slate-600">
                <p>Pending amount: {{ vm.overview.pendingAmount | currency }}</p>
                <p>Paid amount: {{ vm.overview.paidAmount | currency }}</p>
                <p>Overdue amount: {{ vm.overview.overdueAmount | currency }}</p>
              </div>
            </section>
          }
          <section class="rounded-xl border border-slate-200 p-4">
            <h3 class="text-sm font-semibold text-slate-900">Recent activity</h3>
            <div class="mt-2 space-y-2 text-sm text-slate-600">
              @if (vm.recentActivity.length === 0) {
                <p>No recent activity found.</p>
              } @else {
                @for (item of vm.recentActivity; track item.type + item.timestamp + item.title) {
                  <div class="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p class="font-medium text-slate-900">{{ item.title }}</p>
                      <p class="text-xs uppercase tracking-wide text-slate-500">{{ item.type }} · {{ item.status }}</p>
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
  @Input() propertyId: number | null = null;
  @Input() dashboard: PropertyDashboardVm | null = null;

  showBuildingTabs(): boolean {
    return !!this.dashboard?.isBuilding;
  }

  canManageBuildingTabs(): boolean {
    return canManageBuildingOperations(this.dashboard?.currentUserRole);
  }

  showPrivateOwnerTabs(): boolean {
    return !this.dashboard?.isBuilding && canManagePrivatePropertyOperations(this.dashboard?.currentUserRole);
  }

  canViewFinancials(): boolean {
    if (this.dashboard?.isBuilding) {
      return canManageBuildingOperations(this.dashboard?.currentUserRole);
    }

    return canManagePrivatePropertyOperations(this.dashboard?.currentUserRole);
  }
}



