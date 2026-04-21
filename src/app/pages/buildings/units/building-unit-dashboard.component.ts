import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BuildingUnitDetails, InvoiceStatus, UnitStatus, UnitTenantContact } from '../../../models/building/building-unit.model';
import { BuildingUnitService } from '../../../services/building/building-unit.service';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-unit-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-7xl px-4 py-6">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('unit.dashboard.title') }}</h1>
          <p class="text-sm text-slate-600">{{ i18n.translate('unit.dashboard.subtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <a [routerLink]="['/property', buildingId(), 'units']" mat-stroked-button>{{ i18n.translate('unit.dashboard.backToUnits') }}</a>
          <a [routerLink]="['/property', buildingId(), 'units', unitId(), 'leases']" mat-stroked-button>Manage lease</a>
          <a
            mat-stroked-button
            [routerLink]="['/property', buildingId(), 'finances']"
            [queryParams]="{ unitId: unitId() }"
          >
            {{ i18n.translate('building.finance.createInvoice') }}
          </a>
          <button mat-stroked-button (click)="copyDashboardLink()">
            <mat-icon>link</mat-icon>
            {{ i18n.translate('unit.dashboard.copyLink') }}
          </button>
          <button mat-flat-button color="primary" (click)="loadDetails()" [disabled]="loading()">{{ i18n.translate('unit.dashboard.refresh') }}</button>
        </div>
      </div>

      @if (errorMessage()) {
        <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      }

      @if (loading()) {
        <mat-card class="p-6">
          <p class="text-sm text-slate-500">{{ i18n.translate('unit.dashboard.loading') }}</p>
        </mat-card>
      }

      @if (!loading() && unitDetails(); as details) {
        <div class="mb-4 rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">Unit {{ details.unitNumber }} - {{ details.unitType }}</h2>
              <p class="text-sm text-slate-600">{{ i18n.translate('unit.dashboard.ownerTenant') }}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-medium" [ngClass]="unitStatusClass(details.status)">
              {{ details.status }}
            </span>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <mat-card class="p-4">
            <p class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.invoices') }}</p>
            <p class="text-2xl font-semibold text-slate-900">{{ details.totalInvoices }}</p>
          </mat-card>
          <mat-card class="p-4">
            <p class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.paid') }}</p>
            <p class="text-2xl font-semibold text-emerald-700">{{ details.paidInvoices }}</p>
          </mat-card>
          <mat-card class="p-4">
            <p class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.overdue') }}</p>
            <p class="text-2xl font-semibold text-rose-700">{{ details.overdueInvoices }}</p>
          </mat-card>
          <mat-card class="p-4">
            <p class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.collectionHealth') }}</p>
            <p class="text-2xl font-semibold" [ngClass]="collectionHealthClass()">{{ collectionHealth() }}%</p>
          </mat-card>
        </div>

        <div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <mat-card class="p-4">
            <h3 class="mb-2 text-sm font-semibold text-slate-700">{{ i18n.translate('unit.dashboard.ownerProfile') }}</h3>
            <p class="text-sm text-slate-900">{{ details.ownerName || i18n.translate('unit.dashboard.notAssigned') }}</p>
            @if (details.ownerEmail) {
              <p class="text-xs text-slate-500">{{ details.ownerEmail }}</p>
            }
          </mat-card>
          <mat-card class="p-4">
            <h3 class="mb-2 text-sm font-semibold text-slate-700">{{ i18n.translate('unit.dashboard.tenantProfile') }}</h3>
            @if (tenantContacts(details).length === 0) {
              <p class="text-sm text-slate-900">{{ i18n.translate('unit.dashboard.notAssigned') }}</p>
            } @else {
              <div class="space-y-1">
                @for (tenant of tenantContacts(details); track tenant.userId ?? tenant.email ?? $index) {
                  <p class="text-sm text-slate-900">{{ tenantDisplayLabel(tenant) }}</p>
                  @if (tenant.name && tenant.email) {
                    <p class="text-xs text-slate-500">{{ tenant.email }}</p>
                  }
                }
              </div>
            }
          </mat-card>
        </div>

        <mat-card class="p-4">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-lg font-semibold text-slate-900">{{ i18n.translate('unit.dashboard.paymentTimeline') }}</h3>
            <div class="text-sm text-slate-600">
              {{ i18n.translate('unit.dashboard.outstanding') }}: <span class="font-medium text-rose-700">{{ formatMoney(details.outstandingAmount, details.currencyCode) }}</span>
              <span class="mx-2">|</span>
              {{ i18n.translate('unit.dashboard.paid') }}: <span class="font-medium text-emerald-700">{{ formatMoney(details.paidAmount, details.currencyCode) }}</span>
            </div>
          </div>

          @if (details.paymentHistory.length === 0) {
            <p class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{{ i18n.translate('unit.dashboard.noHistory') }}</p>
          } @else {
            <div class="space-y-2">
              @for (item of details.paymentHistory; track item.invoiceId) {
                <div class="rounded-lg border border-slate-200 p-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <a [routerLink]="['/invoices', item.invoiceId]" class="font-semibold text-blue-700 hover:underline">{{ item.invoiceNumber }}</a>
                      <p class="text-xs text-slate-500">
                        {{ item.payerName || item.payerEmail || i18n.translate('unit.dashboard.unknownPayer') }} · Due {{ item.dueDate }}
                      </p>
                    </div>
                    <span class="rounded-full px-2 py-1 text-xs font-medium" [ngClass]="invoiceStatusClass(item.status)">
                      {{ item.status }}
                    </span>
                  </div>
                  <div class="mt-2 grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
                    <p>Total: <span class="font-medium text-slate-900">{{ formatMoney(item.totalAmount, item.currencyCode || details.currencyCode) }}</span></p>
                    <p>Paid: <span class="font-medium text-emerald-700">{{ formatMoney(item.paidAmount, item.currencyCode || details.currencyCode) }}</span></p>
                    <p>Remaining: <span class="font-medium" [ngClass]="item.remainingAmount > 0 ? 'text-rose-700' : 'text-slate-900'">{{ formatMoney(item.remainingAmount, item.currencyCode || details.currencyCode) }}</span></p>
                  </div>
                </div>
              }
            </div>
          }
        </mat-card>

        <mat-card class="mt-4 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">{{ i18n.translate('unit.dashboard.recentActivity') }}</h3>
            <span class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.activityLegend') }}</span>
          </div>

          @if (details.recentActivity.length === 0) {
            <p class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{{ i18n.translate('unit.dashboard.noActivity') }}</p>
          } @else {
            <div class="space-y-2">
              @for (activity of details.recentActivity; track activity.eventAt + activity.title) {
                <div class="rounded-lg border border-slate-200 p-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ activity.title }}</p>
                      @if (activity.description) {
                        <p class="text-xs text-slate-600">{{ activity.description }}</p>
                      }
                    </div>
                    <div class="text-right">
                      <span class="rounded-full px-2 py-1 text-xs font-medium" [ngClass]="activityTypeClass(activity.type)">
                        {{ activity.type }}
                      </span>
                      <p class="mt-1 text-xs text-slate-500">{{ formatDateTime(activity.eventAt) }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `
})
export class UnitDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly unitService = inject(BuildingUnitService);
  private readonly snackBar = inject(MatSnackBar);
  readonly i18n = inject(I18nService);

  readonly buildingId = signal<number>(0);
  readonly unitId = signal<number>(0);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly unitDetails = signal<BuildingUnitDetails | null>(null);

  readonly collectionHealth = computed(() => {
    const details = this.unitDetails();
    if (!details || details.totalInvoices === 0) {
      return 100;
    }
    return Math.round((details.paidInvoices / details.totalInvoices) * 100);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const rawBuildingId = params.get('id') ?? this.route.parent?.snapshot.paramMap.get('id') ?? '0';
      this.buildingId.set(Number(rawBuildingId));
      this.unitId.set(Number(params.get('unitId') || 0));
      this.loadDetails();
    });
  }

  loadDetails(): void {
    if (this.buildingId() <= 0 || this.unitId() <= 0) {
      this.errorMessage.set('Invalid unit link.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.unitService.getUnitDetails(this.buildingId(), this.unitId()).subscribe({
      next: (details) => {
        this.unitDetails.set(details);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not load the unit dashboard.');
        this.loading.set(false);
      }
    });
  }

  formatMoney(value: number | null | undefined, currencyCode?: string): string {
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'BRL',
      maximumFractionDigits: 2
    }).format(amount);
  }

  unitStatusClass(status: UnitStatus): string {
    switch (status) {
      case 'OCCUPIED':
        return 'bg-emerald-100 text-emerald-800';
      case 'VACANT':
        return 'bg-slate-100 text-slate-700';
      case 'MAINTENANCE':
        return 'bg-amber-100 text-amber-800';
      case 'RESERVED':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  collectionHealthClass(): string {
    const health = this.collectionHealth();
    if (health >= 85) {
      return 'text-emerald-700';
    }
    if (health >= 60) {
      return 'text-amber-700';
    }
    return 'text-rose-700';
  }

  invoiceStatusClass(status: InvoiceStatus): string {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800';
      case 'OVERDUE':
        return 'bg-rose-100 text-rose-800';
      case 'PARTIALLY_PAID':
        return 'bg-amber-100 text-amber-800';
      case 'CANCELLED':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  activityTypeClass(type: string): string {
    switch (type) {
      case 'INVOICE_STATUS':
        return 'bg-blue-100 text-blue-800';
      case 'PAYMENT':
        return 'bg-emerald-100 text-emerald-800';
      case 'INCIDENT':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  formatDateTime(value?: string): string {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleString();
  }

  tenantContacts(details: BuildingUnitDetails): UnitTenantContact[] {
    if (details.tenants && details.tenants.length > 0) {
      return details.tenants;
    }
    if (details.tenantName || details.tenantEmail) {
      return [{ name: details.tenantName, email: details.tenantEmail }];
    }
    return [];
  }

  tenantDisplayLabel(tenant: UnitTenantContact): string {
    if (tenant.name && tenant.email) {
      return tenant.name;
    }
    return tenant.name || tenant.email || this.i18n.translate('unit.dashboard.notAssigned');
  }

  copyDashboardLink(): void {
    const link = `${window.location.origin}/properties/${this.buildingId()}/units/${this.unitId()}`;

    navigator.clipboard.writeText(link).then(() => {
      this.snackBar.open(this.i18n.translate('unit.dashboard.linkCopied'), this.i18n.translate('common.close'), { duration: 2200 });
    }).catch(() => {
      this.snackBar.open(this.i18n.translate('unit.dashboard.copyFailed'), this.i18n.translate('common.close'), { duration: 2600 });
    });
  }
}

