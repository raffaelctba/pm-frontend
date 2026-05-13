import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { timeout } from 'rxjs';
import { PropertyService } from '../../../services/property.service';
import { DashboardContextService } from '../../../services/dashboard-context.service';
import { CurrencyService } from '../../../services/currency.service';
import { I18nService } from '../../../services/i18n.service';
import { Property } from '../../../models/property.model';
import { isMultiUnitProperty } from '../../../shared/utils/property-permissions.util';

interface LeaseDraft {
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number | null;
  securityDeposit: number | null;
  notes: string;
}

@Component({
  selector: 'app-property-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-7xl px-4 py-6">
      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p class="text-sm text-slate-500">{{ i18n.translate('common.loadingWorkspace') }}</p>
        </div>
      }

      @if (!loading() && property(); as currentProperty) {
        <section class="mb-6 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-200/60">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-4xl">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                {{ isBuildingProperty(currentProperty) ? i18n.translate('property.workspace.buildingModeTitle') : i18n.translate('property.workspace.privateModeTitle') }}
              </p>
              <h1 class="mt-2 text-3xl font-bold md:text-4xl">{{ currentProperty.name }}</h1>
              <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
                @if (isBuildingProperty(currentProperty)) {
                  {{ i18n.translate('property.workspace.buildingModeDescription') }}
                } @else {
                  {{ i18n.translate('property.workspace.privateModeDescription') }}
                }
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <a [routerLink]="['/property', currentProperty.id, 'edit']" class="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                {{ i18n.translate('property.workspace.editProperty') }}
              </a>
              <a routerLink="/properties" class="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                {{ i18n.translate('property.workspace.backToList') }}
              </a>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-2 text-xs">
            <span class="rounded-full bg-white/10 px-3 py-1 font-medium">{{ getPropertyTypeLabel(currentProperty.propertyType) }}</span>
            <span class="rounded-full bg-white/10 px-3 py-1 font-medium">{{ getStatusLabel(currentProperty.status) }}</span>
            <span class="rounded-full bg-white/10 px-3 py-1 font-medium">{{ isBuildingProperty(currentProperty) ? i18n.translate('property.workspace.buildingOperations') : i18n.translate('property.workspace.privateManagement') }}</span>
          </div>
        </section>

        @if (isBuildingProperty(currentProperty)) {
          <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.totalUnits') }}</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ currentProperty.totalUnits ?? '—' }}</p>
              <p class="mt-2 text-sm text-slate-500">Keep occupancy and unit-level workflows in one place.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.monthlyFee') }}</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">{{ formatCurrency(currentBillingAmount(currentProperty), currentBillingCurrency(currentProperty)) }}</p>
              <p class="mt-2 text-sm text-slate-500">Building billing and recurring charges.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.dueDay') }}</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ currentProperty.billing?.dueDay ?? currentProperty.dueDay ?? '—' }}</p>
              <p class="mt-2 text-sm text-slate-500">Standard billing cycle for unit collections.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.penaltyRules') }}</p>
              <p class="mt-2 text-lg font-bold text-slate-900">
                {{ currentProperty.billing?.lateFeePercentage ?? currentProperty.lateFeePercentage ?? '—' }}%
                + {{ currentProperty.billing?.interestRateMonthly ?? currentProperty.interestRateMonthly ?? '—' }}%
              </p>
              <p class="mt-2 text-sm text-slate-500">Late fee and interest configured for the building.</p>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-xl font-semibold text-slate-900">{{ i18n.translate('property.workspace.buildingOperationsHub') }}</h2>
                  <p class="text-sm text-slate-500">{{ i18n.translate('property.workspace.buildingOperationsHubDesc') }}</p>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{{ i18n.translate('property.workspace.buildingManagement') }}</span>
              </div>

              <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                {{ i18n.translate('property.workspace.modulesSwitchHint') }}
              </div>

              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="rounded-xl border border-slate-200 p-4">
                  <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.immediateFocus') }}</p>
                  <ul class="mt-2 space-y-2 text-sm text-slate-700">
                    <li>• {{ i18n.translate('property.workspace.focusItem1') }}</li>
                    <li>• {{ i18n.translate('property.workspace.focusItem2') }}</li>
                    <li>• {{ i18n.translate('property.workspace.focusItem3') }}</li>
                  </ul>
                </div>
                <div class="rounded-xl border border-slate-200 p-4">
                  <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.governance') }}</p>
                  <ul class="mt-2 space-y-2 text-sm text-slate-700">
                    <li>• {{ i18n.translate('property.workspace.govItem1') }}</li>
                    <li>• {{ i18n.translate('property.workspace.govItem2') }}</li>
                    <li>• {{ i18n.translate('property.workspace.govItem3') }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 class="text-xl font-semibold text-slate-900">{{ i18n.translate('property.workspace.buildingSummary') }}</h2>
              <div class="mt-4 space-y-4 text-sm text-slate-600">
                <div class="rounded-xl bg-white p-4 shadow-sm">
                  <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.address') }}</p>
                  <p class="mt-1 text-slate-900">
                    {{ currentProperty.address?.street || '—' }} {{ currentProperty.address?.number || '' }}
                  </p>
                  <p class="text-slate-900">{{ currentProperty.address?.city || '—' }} - {{ currentProperty.address?.state || '—' }}</p>
                </div>
                <div class="rounded-xl bg-white p-4 shadow-sm">
                  <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.translate('property.workspace.operationsFocus') }}</p>
                  <ul class="mt-2 space-y-2">
                    <li>• {{ i18n.translate('property.workspace.focusBullet1') }}</li>
                    <li>• {{ i18n.translate('property.workspace.focusBullet2') }}</li>
                    <li>• {{ i18n.translate('property.workspace.focusBullet3') }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div class="space-y-6 xl:col-span-2">
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div class="mb-4 flex items-center justify-between gap-3">
                  <div>
                      <h2 class="text-xl font-semibold text-slate-900">{{ i18n.translate('property.workspace.privateWorkspaceTitle') }}</h2>
                      <p class="text-sm text-slate-500">{{ i18n.translate('property.workspace.privateWorkspaceDesc') }}</p>
                  </div>
                      <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">{{ i18n.translate('property.workspace.privateProperty') }}</span>
                </div>

                <form [formGroup]="leaseForm" (ngSubmit)="saveLeaseDraft()" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                        <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.tenantName') }} *</label>
                    <input type="text" formControlName="tenantName" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Tenant full name">
                    @if (leaseForm.controls.tenantName.touched && leaseForm.controls.tenantName.invalid) {
                      <p class="mt-1 text-xs text-red-600">{{ i18n.translate('property.workspace.tenantName') }} is required.</p>
                    }
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.tenantEmail') }}</label>
                    <input type="email" formControlName="tenantEmail" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="tenant@example.com">
                    @if (leaseForm.controls.tenantEmail.touched && leaseForm.controls.tenantEmail.invalid) {
                      <p class="mt-1 text-xs text-red-600">Enter a valid email address.</p>
                    }
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.tenantPhone') }}</label>
                    <input type="text" formControlName="tenantPhone" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="+1 555 000 0000">
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.monthlyRent') }} *</label>
                    <input type="number" min="0" step="0.01" formControlName="monthlyRent" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="0.00">
                    @if (leaseForm.controls.monthlyRent.touched && leaseForm.controls.monthlyRent.invalid) {
                      <p class="mt-1 text-xs text-red-600">{{ i18n.translate('property.workspace.monthlyRent') }} is required.</p>
                    }
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.leaseStart') }} *</label>
                    <input type="date" formControlName="leaseStart" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                    @if (leaseForm.controls.leaseStart.touched && leaseForm.controls.leaseStart.invalid) {
                      <p class="mt-1 text-xs text-red-600">{{ i18n.translate('property.workspace.leaseStart') }} is required.</p>
                    }
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.leaseEnd') }}</label>
                    <input type="date" formControlName="leaseEnd" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.securityDeposit') }}</label>
                    <input type="number" min="0" step="0.01" formControlName="securityDeposit" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="0.00">
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">{{ i18n.translate('property.workspace.notes') }}</label>
                    <input type="text" formControlName="notes" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Special clauses, move-in details...">
                  </div>

                  <div class="md:col-span-2 flex items-center justify-between gap-3 pt-2">
                    <p class="text-xs text-slate-500">{{ i18n.translate('property.workspace.contractDraftNote') }}</p>
                    <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                      {{ i18n.translate('property.workspace.createContractDraft') }}
                    </button>
                  </div>
                </form>
              </div>

              @if (savedLease()) {
                <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                  <h3 class="text-lg font-semibold text-emerald-900">{{ i18n.translate('property.workspace.leaseDraftReady') }}</h3>
                  <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 text-sm text-emerald-950">
                    <div>
                      <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">{{ i18n.translate('property.workspace.tenant') }}</p>
                      <p class="mt-1 font-semibold">{{ savedLease()!.tenantName }}</p>
                      <p>{{ savedLease()!.tenantEmail || 'No email provided' }}</p>
                      <p>{{ savedLease()!.tenantPhone || 'No phone provided' }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">{{ i18n.translate('property.workspace.contractDates') }}</p>
                      <p class="mt-1 font-semibold">{{ savedLease()!.leaseStart }} → {{ savedLease()!.leaseEnd || 'Open-ended' }}</p>
                      <p>{{ i18n.translate('property.workspace.rent') }}: {{ formatCurrency(savedLease()!.monthlyRent, currentCurrency(currentProperty)) }}</p>
                      <p>{{ i18n.translate('property.workspace.deposit') }}: {{ formatCurrency(savedLease()!.securityDeposit, currentCurrency(currentProperty)) }}</p>
                    </div>
                    @if (savedLease()!.notes) {
                      <div class="md:col-span-2">
                        <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">{{ i18n.translate('property.workspace.notes') }}</p>
                        <p class="mt-1">{{ savedLease()!.notes }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="space-y-6">
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-semibold text-slate-900">{{ i18n.translate('property.workspace.propertySummary') }}</h2>
                <div class="mt-4 space-y-3 text-sm text-slate-600">
                  <p><span class="font-medium text-slate-900">{{ i18n.translate('property.workspace.type') }}:</span> {{ getPropertyTypeLabel(currentProperty.propertyType) }}</p>
                  <p><span class="font-medium text-slate-900">{{ i18n.translate('property.workspace.status') }}:</span> {{ getStatusLabel(currentProperty.status) }}</p>
                  <p><span class="font-medium text-slate-900">{{ i18n.translate('property.workspace.address') }}:</span> {{ buildAddressLine(currentProperty) || '—' }}</p>
                  <p><span class="font-medium text-slate-900">{{ i18n.translate('property.workspace.bedrooms') }}:</span> {{ currentProperty.bedrooms ?? '—' }}</p>
                  <p><span class="font-medium text-slate-900">{{ i18n.translate('property.workspace.bathrooms') }}:</span> {{ currentProperty.bathrooms ?? '—' }}</p>
                  <p><span class="font-medium text-slate-900">{{ i18n.translate('property.workspace.parkingSpaces') }}:</span> {{ currentProperty.parkingSpaces ?? '—' }}</p>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 class="text-xl font-semibold text-slate-900">{{ i18n.translate('property.workspace.privateActions') }}</h2>
                <p class="mt-3 text-xs text-slate-600">
                  {{ i18n.translate('property.workspace.privateModulesSwitchHint') }}
                </p>
                <ul class="mt-4 space-y-3 text-sm text-slate-700">
                  <li class="rounded-xl border border-slate-200 bg-white px-4 py-3">• {{ i18n.translate('property.workspace.privateStep1') }}</li>
                  <li class="rounded-xl border border-slate-200 bg-white px-4 py-3">• {{ i18n.translate('property.workspace.privateStep2') }}</li>
                  <li class="rounded-xl border border-slate-200 bg-white px-4 py-3">• {{ i18n.translate('property.workspace.privateStep3') }}</li>
                </ul>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-semibold text-slate-900">{{ i18n.translate('property.workspace.maintenanceBoard') }}</h2>
                <ul class="mt-4 space-y-3 text-sm text-slate-600">
                  <li>• {{ i18n.translate('property.workspace.maintenanceItem1') }}</li>
                  <li>• {{ i18n.translate('property.workspace.maintenanceItem2') }}</li>
                  <li>• {{ i18n.translate('property.workspace.maintenanceItem3') }}</li>
                </ul>
              </div>
            </div>
          </div>
        }
      }

      @if (!loading() && !property() && errorMessage()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `
})
export class PropertyManagementComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly dashboardContext = inject(DashboardContextService);
  private readonly currencyService = inject(CurrencyService);
  readonly i18n = inject(I18nService);

  readonly property = signal<Property | null>(null);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly savedLease = signal<LeaseDraft | null>(null);

  readonly leaseForm = this.fb.group({
    tenantName: ['', Validators.required],
    tenantEmail: ['', Validators.email],
    tenantPhone: [''],
    leaseStart: ['', Validators.required],
    leaseEnd: [''],
    monthlyRent: [null as number | null, [Validators.required, Validators.min(0)]],
    securityDeposit: [null as number | null, [Validators.min(0)]],
    notes: ['']
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isFinite(id) && id > 0) {
        this.dashboardContext.setPropertyContext(id);
      }
      this.loadProperty(id);
    });
  }

  loadProperty(id: number): void {
    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid property id.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.property.set(null);
    this.savedLease.set(null);

    this.propertyService.getPropertyById(id).pipe(timeout(15000)).subscribe({
      next: (data) => {
        this.property.set(data);
        this.dashboardContext.setProperty(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.dashboardContext.clearProperty();
        this.errorMessage.set(error?.error?.message ?? 'Could not load the property workspace.');
        this.loading.set(false);
      }
    });
  }

  saveLeaseDraft(): void {
    if (this.leaseForm.invalid) {
      this.leaseForm.markAllAsTouched();
      return;
    }

    this.savedLease.set(this.leaseForm.getRawValue() as LeaseDraft);
  }

  currentBillingAmount(property: Property): number {
    return property.billing?.monthlyFee ?? property.monthlyFee ?? 0;
  }

  currentBillingCurrency(property: Property): string {
    return property.billing?.currencyCode ?? property.currencyCode ?? 'BRL';
  }

  currentCurrency(property: Property): string {
    return this.currentBillingCurrency(property);
  }

  formatCurrency(value: number | null | undefined, currencyCode?: string): string {
    const amount = Number(value ?? 0);
    return this.currencyService.formatCurrency(amount, currencyCode || 'BRL');
  }

  buildAddressLine(property: Property): string {
    const address = property.address;
    if (!address) {
      return '';
    }

    return [
      [address.street, address.number].filter(Boolean).join(', '),
      [address.city, address.state].filter(Boolean).join(' - ')
    ].filter(Boolean).join(' | ');
  }

  getPropertyTypeLabel(type: string): string {
    const keys: Record<string, string> = {
      APARTMENT: 'property.type.apartment',
      HOUSE: 'property.type.house',
      BUILDING: 'property.type.building',
      COMMERCIAL_UNIT: 'property.type.commercialUnit',
      COMMERCIAL_BUILDING: 'property.type.commercialBuilding'
    };
    return this.i18n.translate(keys[type] || type);
  }

  getStatusLabel(status: string): string {
    const keys: Record<string, string> = {
      ACTIVE: 'property.status.active',
      INACTIVE: 'property.status.inactive',
      MAINTENANCE: 'property.status.maintenance',
      SOLD: 'property.status.sold'
    };
    return this.i18n.translate(keys[status] || status);
  }

  isBuildingProperty(property: Property): boolean {
    return isMultiUnitProperty(property.propertyType);
  }
}

