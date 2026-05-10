import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuildingUnitService } from '../../../services/building/building-unit.service';
import { LeaseService } from '../../../services/lease.service';
import { BuildingUnit, UnitAssignee } from '../../../models/building/building-unit.model';
import { Lease, LeaseRequest } from '../../../models/lease.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-building-leases',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('lease.title') }}</h1>
          <p class="text-sm text-slate-600">{{ i18n.translate('lease.subtitle') }}</p>
        </div>
        <a [routerLink]="['/property', buildingId()]" class="btn btn-secondary">{{ i18n.translate('lease.backToProperty') }}</a>
      </div>

      <div class="card mb-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">{{ i18n.translate('lease.unit') }}</label>
            <select class="input" [value]="selectedUnitId() || ''" (change)="onUnitSelect($event)">
              <option value="">{{ i18n.translate('lease.selectUnit') }}</option>
              <option *ngFor="let unit of units()" [value]="unit.id">{{ unit.unitNumber }} - {{ unit.unitType }}</option>
            </select>
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.activeAtDate') }}</label>
            <input class="input" type="date" [value]="filterDate() || ''" (change)="onFilterDate($event)" />
          </div>

          <div class="flex items-end gap-3">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" [checked]="showHistory()" (change)="onHistoryToggle($event)" class="h-4 w-4">
              {{ i18n.translate('lease.showHistory') }}
            </label>
            <button class="btn btn-secondary" (click)="loadLeases()" [disabled]="!selectedUnitId()">{{ i18n.translate('lease.refresh') }}</button>
          </div>
        </div>

        <p *ngIf="errorMessage()" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      </div>

      <div class="card mb-6" *ngIf="selectedUnitId()">
        <h2 class="text-lg font-semibold mb-4">{{ i18n.translate('lease.formTitle') }}</h2>
        <form [formGroup]="leaseForm" (ngSubmit)="submitLease()" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">{{ i18n.translate('lease.startDate') }} *</label>
            <input type="date" formControlName="startDate" class="input" />
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.endDate') }}</label>
            <input type="date" formControlName="endDate" class="input" />
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.monthlyRent') }}</label>
            <input type="number" step="0.01" formControlName="monthlyRent" class="input" />
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.tenantUser') }}</label>
            <select formControlName="tenantUserId" class="input">
              <option [ngValue]="null">{{ i18n.translate('common.none') }}</option>
              <option *ngFor="let tenant of tenants()" [ngValue]="tenant.id">{{ tenant.name || tenant.email }}</option>
            </select>
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.landlordUser') }}</label>
            <select formControlName="landlordUserId" class="input">
              <option [ngValue]="null">{{ i18n.translate('common.none') }}</option>
              <option *ngFor="let landlord of landlords()" [ngValue]="landlord.id">{{ landlord.name || landlord.email }}</option>
            </select>
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.lateFeeOverride') }}</label>
            <input type="number" step="0.01" formControlName="lateFeePercentageOverride" class="input" />
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.interestOverride') }}</label>
            <input type="number" step="0.01" formControlName="interestRateMonthlyOverride" class="input" />
          </div>

          <div>
            <label class="label">{{ i18n.translate('lease.graceOverride') }}</label>
            <input type="number" formControlName="gracePeriodDaysOverride" class="input" />
          </div>

          <div class="md:col-span-3">
            <label class="label">{{ i18n.translate('lease.notes') }}</label>
            <textarea rows="2" formControlName="notes" class="input"></textarea>
          </div>

          <div class="md:col-span-3 flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" (click)="resetForm()">{{ i18n.translate('lease.cancel') }}</button>
            <button type="submit" class="btn btn-primary" [disabled]="leaseForm.invalid || saving()">{{ saving() ? i18n.translate('lease.saving') : i18n.translate('lease.save') }}</button>
          </div>
        </form>
      </div>

      <div class="card" *ngIf="selectedUnitId()">
        <h2 class="text-lg font-semibold mb-4">{{ i18n.translate('lease.listTitle') }}</h2>
        <p *ngIf="leases().length === 0" class="text-sm text-slate-500">{{ i18n.translate('lease.empty') }}</p>

        <div class="space-y-4" *ngIf="showHistory() && leaseHistoryGroups().length > 0">
          <div *ngFor="let group of leaseHistoryGroups()" class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ i18n.translate('lease.timeline.year') }} {{ group.year }}</p>
            <div *ngFor="let lease of group.items" class="rounded border border-slate-200 p-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p class="font-semibold text-slate-900">Lease #{{ lease.id }}</p>
                  <p class="text-xs text-slate-600">{{ lease.startDate }} to {{ lease.endDate || i18n.translate('lease.openEnded') }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="rounded-full px-2 py-1 text-xs font-semibold" [ngClass]="leaseStatusClass(getLeaseStatus(lease))">
                    {{ i18n.translate(leaseStatusLabelKey(getLeaseStatus(lease))) }}
                  </span>
                  <button class="btn btn-secondary" (click)="editLease(lease)">{{ i18n.translate('lease.edit') }}</button>
                  <button class="btn btn-secondary" (click)="deleteLease(lease)">{{ i18n.translate('lease.delete') }}</button>
                </div>
              </div>
              <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
                <p>{{ i18n.translate('lease.monthlyRent') }}: {{ lease.monthlyRent ?? '-' }}</p>
                <p>{{ i18n.translate('lease.lateFeeOverride') }}: {{ lease.lateFeePercentageOverride ?? '-' }}</p>
                <p>{{ i18n.translate('lease.interestOverride') }}: {{ lease.interestRateMonthlyOverride ?? '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2" *ngIf="!showHistory() && leases().length > 0">
          <div *ngFor="let lease of leases()" class="rounded border border-slate-200 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="font-semibold text-slate-900">Lease #{{ lease.id }}</p>
                <p class="text-xs text-slate-600">{{ lease.startDate }} to {{ lease.endDate || i18n.translate('lease.openEnded') }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="rounded-full px-2 py-1 text-xs font-semibold" [ngClass]="leaseStatusClass(getLeaseStatus(lease))">
                  {{ i18n.translate(leaseStatusLabelKey(getLeaseStatus(lease))) }}
                </span>
                <button class="btn btn-secondary" (click)="editLease(lease)">{{ i18n.translate('lease.edit') }}</button>
                <button class="btn btn-secondary" (click)="deleteLease(lease)">{{ i18n.translate('lease.delete') }}</button>
              </div>
            </div>
            <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
              <p>{{ i18n.translate('lease.monthlyRent') }}: {{ lease.monthlyRent ?? '-' }}</p>
              <p>{{ i18n.translate('lease.lateFeeOverride') }}: {{ lease.lateFeePercentageOverride ?? '-' }}</p>
              <p>{{ i18n.translate('lease.interestOverride') }}: {{ lease.interestRateMonthlyOverride ?? '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BuildingLeasesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly buildingUnitService = inject(BuildingUnitService);
  private readonly leaseService = inject(LeaseService);
  readonly i18n = inject(I18nService);

  readonly buildingId = signal<number>(0);
  readonly selectedUnitId = signal<number | null>(null);
  readonly units = signal<BuildingUnit[]>([]);
  readonly landlords = signal<UnitAssignee[]>([]);
  readonly tenants = signal<UnitAssignee[]>([]);
  readonly leases = signal<Lease[]>([]);
  readonly filterDate = signal<string | null>(null);
  readonly showHistory = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly saving = signal<boolean>(false);

  private editingLeaseId: number | null = null;

  readonly leaseForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: [''],
    monthlyRent: [null as number | null],
    lateFeePercentageOverride: [null as number | null],
    interestRateMonthlyOverride: [null as number | null],
    gracePeriodDaysOverride: [null as number | null],
    tenantUserId: [null as number | null],
    landlordUserId: [null as number | null],
    notes: ['']
  });

  ngOnInit(): void {
    const rawBuildingId = this.route.snapshot.paramMap.get('id')
      || this.route.snapshot.paramMap.get('buildingId')
      || this.route.parent?.snapshot.paramMap.get('buildingId')
      || this.route.parent?.snapshot.paramMap.get('id')
      || '0';
    const rawUnitId = this.route.snapshot.paramMap.get('unitId');
    this.buildingId.set(Number(rawBuildingId));
    if (rawUnitId) {
      this.selectedUnitId.set(Number(rawUnitId));
    }

    this.loadUnits();
    this.loadAssignableUsers();
  }

  onHistoryToggle(event: Event): void {
    this.showHistory.set((event.target as HTMLInputElement).checked);
    this.loadLeases();
  }

  loadUnits(): void {
    this.buildingUnitService.getUnits(this.buildingId(), 0, 200).subscribe({
      next: (page) => {
        this.units.set(page.content || []);
        if (!this.selectedUnitId() && page.content?.length) {
          this.selectedUnitId.set(page.content[0].id);
        }
        this.loadLeases();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || this.i18n.translate('lease.error.loadUnits'));
      }
    });
  }

  private loadAssignableUsers(): void {
    this.buildingUnitService.getAssignableUsers(this.buildingId()).subscribe({
      next: (options: { owners: UnitAssignee[]; tenants: UnitAssignee[] }) => {
        this.landlords.set(options.owners || []);
        this.tenants.set(options.tenants || []);
      },
      error: () => {
        this.landlords.set([]);
        this.tenants.set([]);
      }
    });
  }

  onUnitSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedUnitId.set(value ? Number(value) : null);
    this.resetForm();
    this.loadLeases();
  }

  onFilterDate(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterDate.set(value || null);
    this.loadLeases();
  }

  loadLeases(): void {
    this.errorMessage.set('');
    const unitId = this.selectedUnitId();
    if (!unitId) {
      this.leases.set([]);
      return;
    }

    const request$ = this.showHistory()
      ? this.leaseService.getHistoryByUnit(unitId)
      : this.leaseService.getByUnit(unitId, this.filterDate() || undefined);

    request$.subscribe({
      next: (leases) => this.leases.set(leases),
      error: (error) => {
        this.errorMessage.set(error?.error?.message || this.i18n.translate('lease.error.loadLeases'));
      }
    });
  }

  editLease(lease: Lease): void {
    this.editingLeaseId = lease.id;
    this.leaseForm.patchValue({
      startDate: lease.startDate,
      endDate: lease.endDate || '',
      monthlyRent: lease.monthlyRent ?? null,
      lateFeePercentageOverride: lease.lateFeePercentageOverride ?? null,
      interestRateMonthlyOverride: lease.interestRateMonthlyOverride ?? null,
      gracePeriodDaysOverride: lease.gracePeriodDaysOverride ?? null,
      tenantUserId: lease.tenantUserId ?? null,
      landlordUserId: lease.landlordUserId ?? null,
      notes: lease.notes || ''
    });
  }

  submitLease(): void {
    if (this.leaseForm.invalid || !this.selectedUnitId()) {
      this.leaseForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const raw = this.leaseForm.getRawValue();
    const payload: LeaseRequest = {
      id: this.editingLeaseId ?? undefined,
      propertyId: this.buildingId(),
      buildingUnitId: this.selectedUnitId()!,
      startDate: raw.startDate!,
      endDate: raw.endDate || null,
      monthlyRent: raw.monthlyRent,
      lateFeePercentageOverride: raw.lateFeePercentageOverride,
      interestRateMonthlyOverride: raw.interestRateMonthlyOverride,
      gracePeriodDaysOverride: raw.gracePeriodDaysOverride,
      tenantUserId: raw.tenantUserId,
      landlordUserId: raw.landlordUserId,
      notes: raw.notes || null,
      isActive: true
    };

    this.leaseService.createOrUpdate(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.loadLeases();
      },
      error: (error) => {
        this.saving.set(false);
        const backendMessage = error?.error?.message || error?.error;
        const message = typeof backendMessage === 'string' ? backendMessage : this.i18n.translate('lease.error.save');
        this.errorMessage.set(message.includes('Overlapping lease period')
          ? this.i18n.translate('lease.error.overlap')
          : message);
      }
    });
  }

  deleteLease(lease: Lease): void {
    if (!confirm(this.i18n.translate('lease.deleteConfirm') + ` #${lease.id}?`)) {
      return;
    }

    this.leaseService.delete(lease.id).subscribe({
      next: () => this.loadLeases(),
      error: (error) => {
        this.errorMessage.set(error?.error?.message || this.i18n.translate('lease.error.delete'));
      }
    });
  }

  resetForm(): void {
    this.editingLeaseId = null;
    this.leaseForm.reset({
      startDate: '',
      endDate: '',
      monthlyRent: null,
      lateFeePercentageOverride: null,
      interestRateMonthlyOverride: null,
      gracePeriodDaysOverride: null,
      tenantUserId: null,
      landlordUserId: null,
      notes: ''
    });
  }

  readonly leaseHistoryGroups = computed(() => {
    if (!this.showHistory()) {
      return [] as Array<{ year: string; items: Lease[] }>;
    }

    const groups = new Map<string, Lease[]>();
    for (const lease of this.leases()) {
      const year = lease.startDate?.slice(0, 4) || 'Unknown';
      const list = groups.get(year) ?? [];
      list.push(lease);
      groups.set(year, list);
    }

    return Array.from(groups.entries())
      .map(([year, items]) => ({ year, items: [...items].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || '')) }))
      .sort((a, b) => b.year.localeCompare(a.year));
  });

  getLeaseStatus(lease: Lease): 'ACTIVE' | 'UPCOMING' | 'EXPIRED' {
    const referenceDate = this.filterDate() || new Date().toISOString().slice(0, 10);
    if (lease.startDate && lease.startDate > referenceDate) {
      return 'UPCOMING';
    }
    if (lease.endDate && lease.endDate < referenceDate) {
      return 'EXPIRED';
    }
    return 'ACTIVE';
  }

  leaseStatusClass(status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED'): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800';
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  }

  leaseStatusLabelKey(status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED'): string {
    switch (status) {
      case 'ACTIVE':
        return 'lease.status.active';
      case 'UPCOMING':
        return 'lease.status.upcoming';
      default:
        return 'lease.status.expired';
    }
  }
}

