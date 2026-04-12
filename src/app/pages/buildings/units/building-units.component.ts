import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { BuildingUnitService } from '../../../services/building/building-unit.service';
import { BuildingUnit, BuildingUnitDetails, BuildingUnitRequest, InvoiceStatus, UnitAssignee, UnitStatus, UnitTenantContact } from '../../../models/building/building-unit.model';
import { BuildingAlertEvent, BuildingRealtimeService } from '../../../services/building/building-realtime.service';
import { PropertyService } from '../../../services/property.service';
import { I18nService } from '../../../services/i18n.service';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';

@Component({
  selector: 'app-building-units',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.units.title') }}</h1>
          <p class="text-sm text-slate-600">{{ i18n.translate('building.units.subtitle') }}</p>
        </div>
        <a [routerLink]="['/property', buildingId()]" mat-stroked-button>{{ i18n.translate('building.units.backToProperty') }}</a>
      </div>

      <mat-card class="mb-6 p-4">
        @if (!canManageUnits()) {
          <p class="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {{ i18n.translate('building.access.readOnlyNotice') }}
          </p>
        }
        <h2 class="mb-4 text-lg font-semibold">{{ editingUnitId() ? i18n.translate('building.units.editTitle') : i18n.translate('building.units.createTitle') }}</h2>
        @if (canManageUnits()) {
        <form [formGroup]="unitForm" (ngSubmit)="submitUnit()" class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.unitNumber') }}</mat-label>
            <input matInput formControlName="unitNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.unitType') }}</mat-label>
            <input matInput formControlName="unitType" [placeholder]="i18n.translate('unit.type.residential')" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.status') }}</mat-label>
            <mat-select formControlName="status">
              @for (status of statuses; track status) {
                <mat-option [value]="status">{{ getUnitStatusLabel(status) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.floor') }}</mat-label>
            <input matInput type="number" formControlName="floorNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.area') }}</mat-label>
            <input matInput type="number" formControlName="areaSize" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.monthlyFeeOverride') }}</mat-label>
            <input matInput type="number" step="0.01" formControlName="monthlyFeeOverride" />
            <mat-hint>{{ i18n.translate('building.units.monthlyFeeOverrideHint') }}</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Late fee override (%)</mat-label>
            <input matInput type="number" step="0.01" formControlName="lateFeePercentageOverride" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Interest override (%/month)</mat-label>
            <input matInput type="number" step="0.01" formControlName="interestRateMonthlyOverride" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Grace period override (days)</mat-label>
            <input matInput type="number" formControlName="gracePeriodDaysOverride" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.bedrooms') }}</mat-label>
            <input matInput type="number" formControlName="bedrooms" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.units.bathrooms') }}</mat-label>
            <input matInput type="number" formControlName="bathrooms" />
          </mat-form-field>

          <mat-slide-toggle formControlName="occupied" class="self-center">{{ i18n.translate('building.units.occupied') }}</mat-slide-toggle>

          @if (owners().length > 0) {
            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>{{ i18n.translate('building.units.ownerExisting') }}</mat-label>
              <mat-select formControlName="ownerId">
                <mat-option [value]="null">{{ i18n.translate('common.none') }}</mat-option>
                @for (owner of owners(); track owner.id) {
                  <mat-option [value]="owner.id">{{ ownerDisplayName(owner) }}</mat-option>
                }
              </mat-select>
              <mat-hint>{{ i18n.translate('building.units.ownerHint') }}</mat-hint>
            </mat-form-field>
          }

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ i18n.translate('building.units.ownerName') }}</mat-label>
            <input matInput formControlName="ownerName" [placeholder]="i18n.translate('common.optional')" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ i18n.translate('building.units.ownerEmail') }}</mat-label>
            <input matInput formControlName="ownerEmail" placeholder="owner@example.com" />
            @if (unitForm.controls.ownerEmail.invalid && unitForm.controls.ownerEmail.touched) {
              <mat-error>{{ i18n.translate('signup.error.email') }}</mat-error>
            }
          </mat-form-field>

          @if (tenants().length > 0) {
            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>{{ i18n.translate('building.units.tenantExisting') }}</mat-label>
              <mat-select formControlName="tenantId">
                <mat-option [value]="null">{{ i18n.translate('common.none') }}</mat-option>
                @for (tenant of tenants(); track tenant.id) {
                  <mat-option [value]="tenant.id">{{ ownerDisplayName(tenant) }}</mat-option>
                }
              </mat-select>
              <mat-hint>{{ i18n.translate('building.units.tenantHint') }}</mat-hint>
            </mat-form-field>
          }

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ i18n.translate('building.units.tenantName') }}</mat-label>
            <input matInput formControlName="tenantName" [placeholder]="i18n.translate('common.optional')" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ i18n.translate('building.units.tenantEmail') }}</mat-label>
            <input matInput formControlName="tenantEmail" placeholder="tenant@example.com" />
            @if (unitForm.controls.tenantEmail.invalid && unitForm.controls.tenantEmail.touched) {
              <mat-error>{{ i18n.translate('signup.error.email') }}</mat-error>
            }
          </mat-form-field>

          @if (ownersLoading()) {
            <p class="md:col-span-4 text-xs text-slate-500">{{ i18n.translate('building.units.loadingOwners') }}</p>
          }

          @if (assigneeLoadError()) {
            <p class="md:col-span-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">{{ assigneeLoadError() }}</p>
          }

          <div class="md:col-span-4 flex justify-end">
            @if (editingUnitId()) {
              <button mat-stroked-button type="button" class="mr-2" (click)="cancelEdit()" [disabled]="loading()">
                {{ i18n.translate('building.units.cancel') }}
              </button>
            }
            <button mat-flat-button color="primary" type="submit" [disabled]="unitForm.invalid || loading()">
              {{ editingUnitId() ? i18n.translate('building.units.saveChanges') : i18n.translate('building.units.createUnit') }}
            </button>
          </div>
        </form>
        }
      </mat-card>

      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ i18n.translate('building.units.units') }} ({{ totalElements() }})</h2>
          <button mat-stroked-button (click)="loadUnits()" [disabled]="loading()">{{ i18n.translate('building.units.refresh') }}</button>
        </div>

        @if (errorMessage()) {
          <p class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        @if (loading()) {
          <p class="text-sm text-slate-500">{{ i18n.translate('building.units.loadingUnits') }}</p>
        }

        @if (!loading()) {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="units()" class="w-full">
              <ng-container matColumnDef="unitNumber">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.units.unitNumber') }}</th>
                <td mat-cell *matCellDef="let row">
                  <a class="text-blue-700 hover:text-blue-900 hover:underline" [routerLink]="['/property', buildingId(), 'units', row.id]">
                    {{ row.unitNumber }}
                  </a>
                </td>
              </ng-container>

              <ng-container matColumnDef="unitType">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.units.unitType') }}</th>
                <td mat-cell *matCellDef="let row">{{ getUnitTypeLabel(row.unitType) }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.units.status') }}</th>
                <td mat-cell *matCellDef="let row">{{ getUnitStatusLabel(row.status) }}</td>
              </ng-container>

              <ng-container matColumnDef="owner">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.units.ownerName') }}</th>
                <td mat-cell *matCellDef="let row">{{ unitPersonLabel(row.ownerName, row.ownerEmail) }}</td>
              </ng-container>

              <ng-container matColumnDef="tenant">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.units.tenantName') }}</th>
                <td mat-cell *matCellDef="let row">{{ unitPersonLabel(row.tenantName, row.tenantEmail) }}</td>
              </ng-container>

              <ng-container matColumnDef="floorNumber">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.units.floor') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.floorNumber ?? '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="occupied">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.units.occupied') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.occupied ? i18n.translate('common.yes') : i18n.translate('common.no') }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.workOrders.actions') }}</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="primary" (click)="startEdit(row)" [attr.aria-label]="i18n.translate('building.units.edit')" [disabled]="!canManageUnits()">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <a mat-icon-button [routerLink]="['/property', buildingId(), 'units', row.id]" [attr.aria-label]="i18n.translate('building.units.openDashboard')">
                    <mat-icon>open_in_new</mat-icon>
                  </a>
                  <a mat-icon-button [routerLink]="['/property', buildingId(), 'units', row.id, 'leases']" aria-label="Manage lease">
                    <mat-icon>assignment</mat-icon>
                  </a>
                  <button mat-icon-button (click)="openUnitDetails(row)" [attr.aria-label]="i18n.translate('building.units.preview')">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteUnit(row)" [disabled]="!canManageUnits()">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalElements()"
            [pageIndex]="pageIndex()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 20, 50]"
            (page)="onPage($event)"
          />

          @if (selectedUnitDetails()) {
            <div class="mt-6 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              @if (detailsLoading()) {
                <p class="text-sm text-slate-500">{{ i18n.translate('common.loadingWorkspace') }}</p>
              } @else {
                @if (detailsError()) {
                  <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ detailsError() }}</p>
                }

                @if (selectedUnitDetails(); as details) {
                  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 class="text-xl font-semibold text-slate-900">{{ i18n.translate('unit.dashboard.title') }} {{ details.unitNumber }}</h3>
                      <p class="text-sm text-slate-600">{{ i18n.translate('unit.dashboard.subtitle') }}</p>
                    </div>
                    <span class="rounded-full px-3 py-1 text-xs font-medium" [ngClass]="statusBadgeClass(details.status)">
                      {{ getUnitStatusLabel(details.status) }}
                    </span>
                  </div>

                  <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div class="rounded-lg border border-slate-200 bg-white p-3">
                      <p class="text-xs text-slate-500">{{ i18n.translate('building.finance.totalInvoices') }}</p>
                      <p class="text-xl font-semibold text-slate-900">{{ details.totalInvoices }}</p>
                    </div>
                    <div class="rounded-lg border border-slate-200 bg-white p-3">
                      <p class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.paid') }}</p>
                      <p class="text-xl font-semibold text-emerald-700">{{ details.paidInvoices }}</p>
                    </div>
                    <div class="rounded-lg border border-slate-200 bg-white p-3">
                      <p class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.overdue') }}</p>
                      <p class="text-xl font-semibold text-rose-700">{{ details.overdueInvoices }}</p>
                    </div>
                    <div class="rounded-lg border border-slate-200 bg-white p-3">
                      <p class="text-xs text-slate-500">{{ i18n.translate('unit.dashboard.outstanding') }}</p>
                      <p class="text-xl font-semibold text-slate-900">{{ formatMoney(details.outstandingAmount, details.currencyCode) }}</p>
                    </div>
                  </div>

                  <div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="rounded-lg border border-slate-200 bg-white p-4">
                      <h4 class="mb-2 text-sm font-semibold text-slate-700">{{ i18n.translate('unit.dashboard.ownerProfile') }}</h4>
                      <p class="text-sm text-slate-900">{{ details.ownerName || i18n.translate('unit.dashboard.notAssigned') }}</p>
                      @if (details.ownerEmail) {
                        <p class="text-xs text-slate-500">{{ details.ownerEmail }}</p>
                      }
                    </div>
                    <div class="rounded-lg border border-slate-200 bg-white p-4">
                      <h4 class="mb-2 text-sm font-semibold text-slate-700">{{ i18n.translate('unit.dashboard.tenantProfile') }}</h4>
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
                    </div>
                  </div>

                  <div>
                    <h4 class="mb-3 text-sm font-semibold text-slate-700">{{ i18n.translate('unit.dashboard.paymentTimeline') }}</h4>
                    @if (details.paymentHistory.length === 0) {
                      <p class="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">{{ i18n.translate('unit.dashboard.noHistory') }}</p>
                    } @else {
                      <div class="space-y-2">
                        @for (item of details.paymentHistory; track item.invoiceId) {
                          <div class="rounded-lg border border-slate-200 bg-white p-3">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p class="text-sm font-semibold text-slate-900">{{ item.invoiceNumber }}</p>
                                <p class="text-xs text-slate-500">{{ i18n.translate('building.finance.dueDate') }} {{ item.dueDate }} · {{ item.payerName || item.payerEmail || i18n.translate('unit.dashboard.unknownPayer') }}</p>
                              </div>
                              <span class="rounded-full px-2 py-1 text-xs font-medium" [ngClass]="invoiceStatusClass(item.status)">
                                {{ getInvoiceStatusLabel(item.status) }}
                              </span>
                            </div>
                            <div class="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-600 md:grid-cols-3">
                              <p>{{ i18n.translate('unit.dashboard.totalAmount') }}: <span class="font-medium text-slate-900">{{ formatMoney(item.totalAmount, item.currencyCode || details.currencyCode) }}</span></p>
                              <p>{{ i18n.translate('unit.dashboard.paidAmount') }}: <span class="font-medium text-emerald-700">{{ formatMoney(item.paidAmount, item.currencyCode || details.currencyCode) }}</span></p>
                              <p>{{ i18n.translate('unit.dashboard.remainingAmount') }}: <span class="font-medium" [ngClass]="item.remainingAmount > 0 ? 'text-rose-700' : 'text-slate-900'">{{ formatMoney(item.remainingAmount, item.currencyCode || details.currencyCode) }}</span></p>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              }
            </div>
          }
        }
      </mat-card>
    </div>
  `
})
export class BuildingUnitsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly unitService = inject(BuildingUnitService);
  private readonly propertyService = inject(PropertyService);
  readonly i18n = inject(I18nService);
  private readonly realtimeService = inject(BuildingRealtimeService);
  private readonly snackBar = inject(MatSnackBar);
  private alertSubscription: Subscription | null = null;

  readonly buildingId = signal<number>(0);
  readonly units = signal<BuildingUnit[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly owners = signal<UnitAssignee[]>([]);
  readonly tenants = signal<UnitAssignee[]>([]);
  readonly ownersLoading = signal<boolean>(false);
  readonly assigneeLoadError = signal<string>('');
  readonly editingUnitId = signal<number | null>(null);
  readonly selectedUnitId = signal<number | null>(null);
  readonly selectedUnitDetails = signal<BuildingUnitDetails | null>(null);
  readonly detailsLoading = signal<boolean>(false);
  readonly detailsError = signal<string>('');
  readonly canManageUnits = signal<boolean>(false);
  readonly displayedColumns: string[] = ['unitNumber', 'unitType', 'status', 'owner', 'tenant', 'floorNumber', 'occupied', 'actions'];
  readonly statuses: UnitStatus[] = ['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];

  readonly unitForm = this.fb.nonNullable.group({
    unitNumber: ['', [Validators.required, Validators.maxLength(30)]],
    unitType: ['RESIDENTIAL', [Validators.required, Validators.maxLength(40)]],
    status: ['VACANT' as UnitStatus, Validators.required],
    floorNumber: [0],
    areaSize: [null as number | null],
    monthlyFeeOverride: [null as number | null],
    lateFeePercentageOverride: [null as number | null],
    interestRateMonthlyOverride: [null as number | null],
    gracePeriodDaysOverride: [null as number | null],
    bedrooms: [null as number | null],
    bathrooms: [null as number | null],
    parkingSpot: [null as string | null],
    storageUnit: [null as string | null],
    occupied: [false],
    ownerId: [null as number | null],
    ownerName: ['', [Validators.maxLength(120)]],
    ownerEmail: ['', [Validators.email, Validators.maxLength(150)]],
    tenantId: [null as number | null],
    tenantName: ['', [Validators.maxLength(120)]],
    tenantEmail: ['', [Validators.email, Validators.maxLength(150)]]
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('buildingId')
      ?? this.route.snapshot.paramMap.get('id')
      ?? this.route.parent?.snapshot.paramMap.get('id')
      ?? '0';
    this.buildingId.set(Number(rawId));

    this.realtimeService.connectToBuildingAlerts(this.buildingId());
    this.alertSubscription = this.realtimeService.events$().subscribe((event) => this.onRealtimeAlert(event));

    this.loadAccessProfile();
    this.loadUnits();
  }

  ngOnDestroy(): void {
    this.alertSubscription?.unsubscribe();
    this.alertSubscription = null;
    this.realtimeService.disconnect();
  }

  loadUnits(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.unitService.getUnits(this.buildingId(), this.pageIndex(), this.pageSize()).subscribe({
      next: (response) => {
        this.units.set(response.content);
        this.totalElements.set(response.totalElements);
        this.pageIndex.set(response.pageable.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not load units.');
        this.loading.set(false);
      }
    });
  }

  submitUnit(): void {
    if (!this.canManageUnits()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const payload = this.buildCreatePayload();
    const editingId = this.editingUnitId();
    this.loading.set(true);

    const request$ = editingId
      ? this.unitService.updateUnit(this.buildingId(), editingId, payload)
      : this.unitService.createUnit(this.buildingId(), payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(editingId ? 'Unit updated successfully.' : 'Unit created successfully.', 'Close', { duration: 2500 });
        this.resetFormToCreateMode();
        this.loadUnits();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? (editingId ? 'Could not update unit.' : 'Could not create unit.'));
        this.loading.set(false);
      }
    });
  }

  startEdit(unit: BuildingUnit): void {
    if (!this.canManageUnits()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    this.editingUnitId.set(unit.id);
    this.errorMessage.set('');
    this.unitForm.patchValue({
      unitNumber: unit.unitNumber,
      unitType: unit.unitType,
      status: unit.status,
      floorNumber: unit.floorNumber ?? 0,
      areaSize: unit.areaSize ?? null,
      monthlyFeeOverride: unit.monthlyFeeOverride ?? null,
      lateFeePercentageOverride: unit.lateFeePercentageOverride ?? null,
      interestRateMonthlyOverride: unit.interestRateMonthlyOverride ?? null,
      gracePeriodDaysOverride: unit.gracePeriodDaysOverride ?? null,
      bedrooms: unit.bedrooms ?? null,
      bathrooms: unit.bathrooms ?? null,
      parkingSpot: unit.parkingSpot ?? null,
      storageUnit: unit.storageUnit ?? null,
      occupied: unit.occupied,
      ownerId: unit.ownerId ?? null,
      ownerName: unit.ownerName ?? '',
      ownerEmail: unit.ownerEmail ?? '',
      tenantId: unit.tenantId ?? null,
      tenantName: unit.tenantName ?? '',
      tenantEmail: unit.tenantEmail ?? ''
    });
  }

  cancelEdit(): void {
    this.resetFormToCreateMode();
  }

  openUnitDetails(unit: BuildingUnit): void {
    this.selectedUnitId.set(unit.id);
    this.detailsLoading.set(true);
    this.detailsError.set('');
    this.selectedUnitDetails.set(null);

    this.unitService.getUnitDetails(this.buildingId(), unit.id).subscribe({
      next: (details) => {
        this.selectedUnitDetails.set(details);
        this.detailsLoading.set(false);
      },
      error: (error) => {
        this.detailsError.set(error?.error?.message ?? 'Could not load unit details.');
        this.detailsLoading.set(false);
      }
    });
  }

  deleteUnit(unit: BuildingUnit): void {
    if (!this.canManageUnits()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (!confirm(`Delete unit ${unit.unitNumber}?`)) {
      return;
    }

    this.loading.set(true);
    this.unitService.deleteUnit(this.buildingId(), unit.id).subscribe({
      next: () => {
        this.snackBar.open('Unit deleted.', 'Close', { duration: 2500 });
        this.loadUnits();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not delete unit.');
        this.loading.set(false);
      }
    });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadUnits();
  }

  private onRealtimeAlert(event: BuildingAlertEvent): void {
    if (event.buildingId !== this.buildingId()) {
      return;
    }

    const message = event.type === 'iot-alert'
      ? `${event.sensorType ?? 'Sensor'} alert from ${event.source ?? 'unknown source'}: ${event.value ?? '-'}${event.unit ?? ''} (threshold ${event.threshold ?? '-'}${event.unit ?? ''})`
      : `${event.type}: update received for building ${event.buildingId}`;

    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  private loadAccessProfile(): void {
    this.propertyService.getPropertyById(this.buildingId()).subscribe({
      next: (property) => {
        this.canManageUnits.set(canManageBuildingOperations(property.currentUserRole));
        this.loadAssignableUsers();
      },
      error: () => {
        this.canManageUnits.set(false);
        this.loadAssignableUsers();
      }
    });
  }

  private loadAssignableUsers(): void {
    if (!this.canManageUnits()) {
      this.ownersLoading.set(false);
      this.owners.set([]);
      this.tenants.set([]);
      this.assigneeLoadError.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    this.ownersLoading.set(true);
    this.assigneeLoadError.set('');

    this.unitService.getAssignableUsers(this.buildingId()).subscribe({
      next: (response) => {
        this.owners.set(response.owners ?? []);
        this.tenants.set(response.tenants ?? []);
        this.ownersLoading.set(false);
      },
      error: () => {
        this.owners.set([]);
        this.tenants.set([]);
        this.assigneeLoadError.set('Owner and tenant options could not be loaded. You can still provide details manually.');
        this.ownersLoading.set(false);
      }
    });
  }

  ownerDisplayName(owner: UnitAssignee): string {
    if (owner.name && owner.name.trim().length > 0) {
      return `${owner.name} (${owner.email})`;
    }
    const fullName = `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim();
    return fullName.length > 0 ? `${fullName} (${owner.email})` : owner.email;
  }

  unitPersonLabel(name?: string, email?: string): string {
    if (name && email) {
      return `${name} (${email})`;
    }
    return name || email || '-';
  }

  getUnitStatusLabel(status: UnitStatus): string {
    return this.i18n.translate(`unit.status.${status.toLowerCase()}`);
  }

  getUnitTypeLabel(unitType: string): string {
    const normalized = (unitType ?? '').trim().toLowerCase();
    if (normalized === 'residential') {
      return this.i18n.translate('unit.type.residential');
    }
    if (normalized === 'commercial') {
      return this.i18n.translate('unit.type.commercial');
    }
    return unitType || this.i18n.translate('common.notAvailable');
  }

  getInvoiceStatusLabel(status: InvoiceStatus): string {
    const normalized = (status ?? '').toLowerCase();
    return this.i18n.translate(`invoice.status.${normalized}`);
  }

  formatMoney(value: number | null | undefined, currencyCode?: string): string {
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'BRL',
      maximumFractionDigits: 2
    }).format(amount);
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

  statusBadgeClass(status: UnitStatus): string {
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

  private buildCreatePayload(): BuildingUnitRequest {
    const raw = this.unitForm.getRawValue();
    return {
      unitNumber: raw.unitNumber,
      unitType: raw.unitType,
      status: raw.status,
      floorNumber: raw.floorNumber,
      areaSize: raw.areaSize,
      monthlyFeeOverride: raw.monthlyFeeOverride,
      lateFeePercentageOverride: raw.lateFeePercentageOverride,
      interestRateMonthlyOverride: raw.interestRateMonthlyOverride,
      gracePeriodDaysOverride: raw.gracePeriodDaysOverride,
      bedrooms: raw.bedrooms,
      bathrooms: raw.bathrooms,
      parkingSpot: raw.parkingSpot,
      storageUnit: raw.storageUnit,
      occupied: raw.occupied,
      ownerId: raw.ownerId,
      ownerName: raw.ownerName?.trim() || null,
      ownerEmail: raw.ownerEmail?.trim() || null,
      tenantId: raw.tenantId,
      tenantName: raw.tenantName?.trim() || null,
      tenantEmail: raw.tenantEmail?.trim() || null
    };
  }

  private resetFormToCreateMode(): void {
    this.editingUnitId.set(null);
    this.unitForm.patchValue({
      unitNumber: '',
      unitType: 'RESIDENTIAL',
      status: 'VACANT' as UnitStatus,
      floorNumber: 0,
      areaSize: null,
      monthlyFeeOverride: null,
      lateFeePercentageOverride: null,
      interestRateMonthlyOverride: null,
      gracePeriodDaysOverride: null,
      bedrooms: null,
      bathrooms: null,
      parkingSpot: null,
      storageUnit: null,
      occupied: false,
      ownerId: null,
      ownerName: '',
      ownerEmail: '',
      tenantId: null,
      tenantName: '',
      tenantEmail: ''
    });
    this.unitForm.markAsPristine();
    this.unitForm.markAsUntouched();
  }
}
