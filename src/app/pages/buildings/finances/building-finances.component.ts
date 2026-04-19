import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  BuildingBulkInvoiceGenerationRequest,
  BuildingBulkInvoiceGenerationResult,
  BuildingBulkInvoicePreviewItem,
  BuildingBulkInvoicePreviewResult,
  BuildingFinanceInvoice,
  BuildingFinanceInvoiceRequest,
  BuildingFinanceSummary,
  InvoiceStatus
} from '../../../models/building/building-finance.model';
import { BuildingUnit } from '../../../models/building/building-unit.model';
import { BuildingFinanceService } from '../../../services/building/building-finance.service';
import { BuildingUnitService } from '../../../services/building/building-unit.service';
import { I18nService } from '../../../services/i18n.service';
import { PropertyService } from '../../../services/property.service';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';
import { formatDateInput, parseDisplayDate, formatDisplayDate } from '../../../shared/utils/date-formatter.util';

@Component({
  selector: 'app-building-finances',
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
          <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.finance.title') }}</h1>
          <p class="text-sm text-slate-600">{{ i18n.translate('building.finance.subtitle') }}</p>
        </div>
        <a [routerLink]="['/property', buildingId()]" mat-stroked-button>{{ i18n.translate('building.finance.backToProperty') }}</a>
      </div>

      @if (!canManageFinances()) {
        <mat-card class="mb-6 p-4">
          <p class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {{ i18n.translate('building.access.readOnlyNotice') }}
          </p>
        </mat-card>
      }

      @if (canManageFinances()) {
      @if (summary()) {
        <mat-card class="mb-6 p-4">
          <h2 class="mb-3 text-lg font-semibold">{{ i18n.translate('building.finance.summary') }}</h2>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="rounded bg-slate-50 p-3 text-sm">
              <p class="text-slate-500">{{ i18n.translate('building.finance.totalInvoices') }}</p>
              <p class="text-xl font-semibold">{{ summary()!.totalInvoices }}</p>
            </div>
            <div class="rounded bg-slate-50 p-3 text-sm">
              <p class="text-slate-500">{{ i18n.translate('building.finance.pendingAmount') }}</p>
              <p class="text-xl font-semibold">{{ summary()!.pendingAmount }}</p>
            </div>
            <div class="rounded bg-slate-50 p-3 text-sm">
              <p class="text-slate-500">{{ i18n.translate('building.finance.paidAmount') }}</p>
              <p class="text-xl font-semibold">{{ summary()!.paidAmount }}</p>
            </div>
            <div class="rounded bg-slate-50 p-3 text-sm">
              <p class="text-slate-500">{{ i18n.translate('building.finance.overdueAmount') }}</p>
              <p class="text-xl font-semibold">{{ summary()!.overdueAmount }}</p>
            </div>
          </div>
        </mat-card>
      }

      <mat-card class="mb-6 p-4">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold">{{ applyToAllUnits() ? i18n.translate('building.finance.generateAllTitle') : i18n.translate('building.finance.createInvoice') }}</h2>
          <label class="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm text-slate-700">
            <input type="checkbox" [checked]="applyToAllUnits()" (change)="onApplyToAllUnitsToggle($event)" />
            Aplicar para todas as unidades
          </label>
        </div>

        @if (!applyToAllUnits()) {
        <form [formGroup]="form" (ngSubmit)="createInvoice()" class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>{{ i18n.translate('building.finance.unitId') }}</mat-label>
            <mat-select formControlName="unitId">
              <mat-option [value]="null">{{ i18n.translate('common.none') }}</mat-option>
              @for (unit of invoiceUnits(); track unit.id) {
                <mat-option [value]="unit.id" [disabled]="!unitRecipientUserId(unit)">
                  {{ unitInvoiceLabel(unit) }}
                </mat-option>
              }
            </mat-select>
            <mat-hint>{{ i18n.translate('building.finance.unitIdHint') }}</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.amount') }}</mat-label>
            <input matInput type="number" formControlName="amount" />
          </mat-form-field>

          <div class="md:col-span-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <p class="font-semibold">Taxas extras (ex.: estacionamento, aluguel de salao/facilidade)</p>
            <p class="text-xs text-slate-500">Adicione uma ou mais taxas extras; elas serao somadas ao valor base da fatura.</p>
          </div>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Tipo de custo extra</mat-label>
            <mat-select formControlName="extraFeeType" (selectionChange)="onExtraFeeTypeChange($event.value)">
              <mat-option value="">Selecione...</mat-option>
              @for (preset of extraFeePresets; track preset.key) {
                <mat-option [value]="preset.key">{{ preset.label }}</mat-option>
              }
              <mat-option value="CUSTOM">Outro / personalizado</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Custo extra (descricao)</mat-label>
            <input matInput formControlName="extraFeeLabel" placeholder="Ex: Parking / Facility rental" [disabled]="form.controls.extraFeeType.value !== 'CUSTOM' && !!form.controls.extraFeeType.value" />
          </mat-form-field>

          @if (form.controls.extraFeeType.value) {
            <mat-form-field appearance="outline">
              <mat-label>Quantidade</mat-label>
              <input matInput type="number" formControlName="extraFeeQuantity" min="1" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valor unitario</mat-label>
              <input matInput type="number" formControlName="extraFeeUnitPrice" min="0" step="0.01" />
            </mat-form-field>

            <div class="flex items-center md:col-span-1">
              <button mat-stroked-button type="button" (click)="addExtraFee()">Adicionar custo</button>
            </div>
          }

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.dueDate') }}</mat-label>
            <input
              matInput
              type="text"
              inputmode="numeric"
              autocomplete="off"
              maxlength="10"
              placeholder="dd-MM-yyyy"
              formControlName="dueDate"
              (input)="onDateInput('create', 'dueDate', $event)"
              (keydown)="onDateKeyDown($event)"
              (paste)="onDatePaste('create', 'dueDate', $event)"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.referenceMonth') }}</mat-label>
            <input
              matInput
              type="text"
              inputmode="numeric"
              autocomplete="off"
              maxlength="10"
              placeholder="dd-MM-yyyy"
              formControlName="referenceMonth"
              (input)="onDateInput('create', 'referenceMonth', $event)"
              (keydown)="onDateKeyDown($event)"
              (paste)="onDatePaste('create', 'referenceMonth', $event)"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-4">
            <mat-label>{{ i18n.translate('building.finance.description') }}</mat-label>
            <input matInput formControlName="description" />
          </mat-form-field>

          @if (extraFees().length > 0) {
            <div class="md:col-span-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Custos adicionais aplicados</p>
              <div class="mt-2 space-y-2">
                @for (fee of extraFees(); track fee.label + fee.amount + $index; let idx = $index) {
                  <div class="flex items-center justify-between rounded bg-white px-3 py-2 text-sm">
                    <span class="text-slate-700">{{ fee.label }} ({{ fee.quantity }} x {{ fee.unitPrice | number:'1.2-2' }}): {{ fee.amount | number:'1.2-2' }}</span>
                    <button mat-icon-button type="button" (click)="removeExtraFee(idx)" aria-label="Remove extra fee">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <p class="mt-3 text-sm font-medium text-slate-900">Total de extras: {{ extraFeesTotal() | number:'1.2-2' }}</p>
            </div>
          }

          <div class="md:col-span-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
            <p class="text-blue-900">
              Valor base: <span class="font-semibold">{{ form.controls.amount.value || 0 | number:'1.2-2' }}</span>
              <span class="mx-2">|</span>
              Extras: <span class="font-semibold">{{ extraFeesTotal() | number:'1.2-2' }}</span>
              <span class="mx-2">|</span>
              Total da fatura: <span class="font-semibold">{{ invoiceGrandTotal() | number:'1.2-2' }}</span>
            </p>
          </div>

          @if (selectedInvoiceUnit(); as selectedUnit) {
            <div class="md:col-span-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ i18n.translate('building.finance.recipientPreview') }}</p>
              <p class="mt-1 text-sm text-slate-900">{{ unitRecipientPreview(selectedUnit) }}</p>
              @if (!unitRecipientUserId(selectedUnit)) {
                <p class="mt-1 text-xs text-amber-700">{{ i18n.translate('building.finance.unitMissingRecipient') }}</p>
              }
            </div>
          }

          @if (invoiceUnitsLoading()) {
            <p class="md:col-span-4 text-xs text-slate-500">{{ i18n.translate('building.units.loadingUnits') }}</p>
          }

          @if (invoiceUnitsLoadError()) {
            <p class="md:col-span-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">{{ invoiceUnitsLoadError() }}</p>
          }

          <div class="md:col-span-4 flex justify-end">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading() || !selectedInvoiceCanBeBilled()">{{ i18n.translate('building.finance.createInvoice') }}</button>
          </div>
        </form>
        } @else {
        <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <p class="font-semibold">{{ i18n.translate('building.finance.generateAllDesc') }}</p>
        </div>
        <form [formGroup]="bulkForm" class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.referenceMonthRequired') }}</mat-label>
            <input
              matInput
              type="text"
              inputmode="numeric"
              autocomplete="off"
              maxlength="10"
              placeholder="dd-MM-yyyy"
              formControlName="referenceMonth"
              (input)="onDateInput('bulk', 'referenceMonth', $event)"
              (keydown)="onDateKeyDown($event)"
              (paste)="onDatePaste('bulk', 'referenceMonth', $event)"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.dueDateOptional') }}</mat-label>
            <input
              matInput
              type="text"
              inputmode="numeric"
              autocomplete="off"
              maxlength="10"
              placeholder="dd-MM-yyyy"
              formControlName="dueDate"
              (input)="onDateInput('bulk', 'dueDate', $event)"
              (keydown)="onDateKeyDown($event)"
              (paste)="onDatePaste('bulk', 'dueDate', $event)"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-3">
            <mat-label>{{ i18n.translate('building.finance.descriptionOptional') }}</mat-label>
            <input matInput formControlName="description" [placeholder]="i18n.translate('building.finance.description')" (input)="markBulkPreviewStale()" />
          </mat-form-field>

          <div class="md:col-span-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <p class="font-semibold">Taxas extras aplicadas a todas as unidades</p>
            <p class="text-xs text-slate-500">As taxas abaixo serao adicionadas em cada fatura gerada em lote.</p>
          </div>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Tipo de custo extra</mat-label>
            <mat-select formControlName="extraFeeType" (selectionChange)="onBulkExtraFeeTypeChange($event.value)">
              <mat-option value="">Selecione...</mat-option>
              @for (preset of extraFeePresets; track preset.key) {
                <mat-option [value]="preset.key">{{ preset.label }}</mat-option>
              }
              <mat-option value="CUSTOM">Outro / personalizado</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-1">
            <mat-label>Custo extra (descricao)</mat-label>
            <input matInput formControlName="extraFeeLabel" [disabled]="bulkForm.controls.extraFeeType.value !== 'CUSTOM' && !!bulkForm.controls.extraFeeType.value" />
          </mat-form-field>

          @if (bulkForm.controls.extraFeeType.value) {
            <mat-form-field appearance="outline">
              <mat-label>Quantidade</mat-label>
              <input matInput type="number" formControlName="extraFeeQuantity" min="1" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valor unitario</mat-label>
              <input matInput type="number" formControlName="extraFeeUnitPrice" min="0" step="0.01" />
            </mat-form-field>

            <div class="flex items-center">
              <button mat-stroked-button type="button" (click)="addBulkExtraFee()">Adicionar custo</button>
            </div>
          }

          @if (extraFeesBulk().length > 0) {
            <div class="md:col-span-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Custos aplicados no lote</p>
              <div class="mt-2 space-y-2">
                @for (fee of extraFeesBulk(); track fee.label + fee.amount + $index; let idx = $index) {
                  <div class="flex items-center justify-between rounded bg-white px-3 py-2 text-sm">
                    <span class="text-slate-700">{{ fee.label }} ({{ fee.quantity }} x {{ fee.unitPrice | number:'1.2-2' }}): {{ fee.amount | number:'1.2-2' }}</span>
                    <button mat-icon-button type="button" (click)="removeBulkExtraFee(idx)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <p class="mt-3 text-sm font-medium text-slate-900">Extras por fatura do lote: {{ bulkExtraFeesTotal() | number:'1.2-2' }}</p>
            </div>
          }

          <div class="md:col-span-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-blue-900">Previa por unidade (base + extras)</p>
              <p class="text-xs text-blue-800">
                Prontas: {{ bulkPreviewReadyCount() }} · Pendentes: {{ bulkPreviewSkippedCount() }}
              </p>
            </div>

            <div class="mt-2 max-h-64 overflow-auto rounded border border-blue-100 bg-white">
              <table class="w-full text-xs">
                <thead class="bg-slate-50 text-slate-600">
                  <tr>
                    <th class="px-2 py-1 text-left">Unidade</th>
                    <th class="px-2 py-1 text-left">Destinatario</th>
                    <th class="px-2 py-1 text-right">Base</th>
                    <th class="px-2 py-1 text-right">Extras</th>
                    <th class="px-2 py-1 text-right">Total projetado</th>
                    <th class="px-2 py-1 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of bulkPreviewRows(); track row.unitId) {
                    <tr class="border-t border-slate-100">
                      <td class="px-2 py-1 font-medium text-slate-800">{{ row.unitNumber }}</td>
                      <td class="px-2 py-1 text-slate-600">{{ row.recipient }}</td>
                      <td class="px-2 py-1 text-right">{{ row.baseAmount != null ? (row.baseAmount | number:'1.2-2') : '—' }}</td>
                      <td class="px-2 py-1 text-right">{{ row.extrasAmount | number:'1.2-2' }}</td>
                      <td class="px-2 py-1 text-right font-semibold">{{ row.projectedTotal != null ? (row.projectedTotal | number:'1.2-2') : '—' }}</td>
                      <td class="px-2 py-1">
                        <span *ngIf="row.status === 'READY'" class="text-emerald-700">READY</span>
                        <span *ngIf="row.status === 'SKIPPED'" class="text-amber-700">SKIPPED {{ row.reason ? '· ' + row.reason : '' }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          @if (bulkPreviewLoading()) {
            <p class="md:col-span-3 text-xs text-slate-500">Calculando projeção por unidade...</p>
          }

          @if (bulkPreviewStale() && bulkPreview()) {
            <p class="md:col-span-3 text-xs text-amber-700">A projeção ficou desatualizada. Atualize para validar os novos valores.</p>
          }

          <div class="md:col-span-3 flex justify-end gap-2">
            <button mat-stroked-button type="button" (click)="previewInvoicesForAllUnits()" [disabled]="loading() || bulkForm.invalid || bulkPreviewLoading()">
              Pré-visualizar impacto
            </button>
            <button mat-flat-button color="primary" type="button" (click)="generateInvoicesForAllUnits()" [disabled]="loading() || bulkForm.invalid">
              {{ i18n.translate('building.finance.generateAllButton') }}
            </button>
          </div>
        </form>
        }
      </mat-card>

      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ i18n.translate('building.finance.invoices') }} ({{ totalElements() }})</h2>
          <div class="flex items-center gap-2">
            <mat-form-field appearance="outline" class="w-48">
              <mat-label>{{ i18n.translate('building.finance.statusFilter') }}</mat-label>
              <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilterChange($event.value)">
                <mat-option value="">{{ i18n.translate('common.all') }}</mat-option>
                @for (status of statuses; track status) {
                  <mat-option [value]="status">{{ status }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <button mat-stroked-button (click)="loadInvoices()" [disabled]="loading()">{{ i18n.translate('building.finance.refresh') }}</button>
          </div>
        </div>

        @if (errorMessage()) {
          <p class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        @if (!loading()) {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="invoices()" class="w-full">
              <ng-container matColumnDef="invoiceNumber">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.finance.invoice') }}</th>
                <td mat-cell *matCellDef="let row">
                  <a [routerLink]="['/invoices', row.id]" class="font-medium text-blue-700 hover:underline">
                    {{ row.invoiceNumber || '-' }}
                  </a>
                </td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let row">{{ row.totalAmount ?? row.amount }}</td>
              </ng-container>

              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.finance.dueDate') }}</th>
                <td mat-cell *matCellDef="let row">{{ formatDisplayDate(row.dueDate) }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.finance.statusFilter') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.status || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.finance.actions') }}</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="primary" (click)="$event.stopPropagation(); markAsPaid(row)" [disabled]="row.status === 'PAID'">
                    <mat-icon>payments</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                class="cursor-pointer hover:bg-slate-50"
                (click)="openInvoice(row.id)"
              ></tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalElements()"
            [pageIndex]="pageIndex()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 20, 50]"
            (page)="onPage($event)"
          />
        }
      </mat-card>

      }
    </div>
  `
})
export class BuildingFinancesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BuildingFinanceService);
  private readonly unitService = inject(BuildingUnitService);
  private readonly propertyService = inject(PropertyService);
  private readonly snackBar = inject(MatSnackBar);
  readonly i18n = inject(I18nService);

  readonly buildingId = signal<number>(0);
  readonly invoiceUnits = signal<BuildingUnit[]>([]);
  readonly invoiceUnitsLoading = signal<boolean>(false);
  readonly invoiceUnitsLoadError = signal<string>('');
  readonly invoices = signal<BuildingFinanceInvoice[]>([]);
  readonly extraFees = signal<Array<{ type: string; label: string; quantity: number; unitPrice: number; amount: number }>>([]);
  readonly extraFeesBulk = signal<Array<{ type: string; label: string; quantity: number; unitPrice: number; amount: number }>>([]);
  readonly buildingDefaultMonthlyFee = signal<number | null>(null);
  readonly bulkPreview = signal<BuildingBulkInvoicePreviewResult | null>(null);
  readonly bulkPreviewLoading = signal<boolean>(false);
  readonly bulkPreviewStale = signal<boolean>(false);
  readonly bulkPreviewLimit = 8;
  readonly extraFeePresets = [
    { key: 'PARKING', label: 'Estacionamento' },
    { key: 'FACILITY_RENTAL', label: 'Aluguel de sala/facilidade' },
    { key: 'ADMIN_FEE', label: 'Taxa administrativa' },
    { key: 'OTHER', label: 'Outra taxa comum' }
  ];
  readonly summary = signal<BuildingFinanceSummary | null>(null);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly statusFilter = signal<InvoiceStatus | ''>('');
  readonly canManageFinances = signal<boolean>(false);
  readonly applyToAllUnits = signal<boolean>(false);
  private pendingUnitId: number | null = null;

  readonly statuses: InvoiceStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];
  readonly displayedColumns: string[] = ['invoiceNumber', 'amount', 'dueDate', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    unitId: [null as number | null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    extraFeeType: [''],
    extraFeeLabel: ['', [Validators.maxLength(120)]],
    extraFeeQuantity: [1, [Validators.min(1)]],
    extraFeeUnitPrice: [0, [Validators.min(0)]],
    dueDate: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{2}-\d{4}$/)]],
    referenceMonth: ['', [Validators.pattern(/^\d{2}-\d{2}-\d{4}$/)]],
    description: ['']
  });

  readonly bulkForm = this.fb.nonNullable.group({
    referenceMonth: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{2}-\d{4}$/)]],
    dueDate: [''],
    description: [''],
    extraFeeType: [''],
    extraFeeLabel: ['', [Validators.maxLength(120)]],
    extraFeeQuantity: [1, [Validators.min(1)]],
    extraFeeUnitPrice: [0, [Validators.min(0)]]
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id')
      ?? this.route.parent?.snapshot.paramMap.get('id')
      ?? '0';
    this.buildingId.set(Number(rawId));

    const rawUnitId = this.route.snapshot.queryParamMap.get('unitId');
    this.pendingUnitId = rawUnitId ? Number(rawUnitId) : null;
    if (this.pendingUnitId !== null && Number.isNaN(this.pendingUnitId)) {
      this.pendingUnitId = null;
    }

    this.loadAccessProfile();
  }

  private loadAccessProfile(): void {
    this.propertyService.getPropertyById(this.buildingId()).subscribe({
      next: (property) => {
        const canManage = canManageBuildingOperations(property.currentUserRole);
        this.canManageFinances.set(canManage);
        this.buildingDefaultMonthlyFee.set(this.resolveBuildingDefaultMonthlyFee(property));
        if (canManage) {
          this.loadInvoiceUnits();
          this.loadSummary();
          this.loadInvoices();
        } else {
          this.invoiceUnits.set([]);
          this.invoiceUnitsLoadError.set('');
        }
      },
      error: () => {
        this.canManageFinances.set(false);
      }
    });
  }

  loadInvoiceUnits(): void {
    this.invoiceUnitsLoading.set(true);
    this.invoiceUnitsLoadError.set('');

    this.unitService.getUnits(this.buildingId(), 0, 1000).subscribe({
      next: (response) => {
        this.invoiceUnits.set((response.content ?? []).slice().sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true, sensitivity: 'base' })));
        this.applyPendingUnitSelection();
        this.invoiceUnitsLoading.set(false);
      },
      error: () => {
        this.invoiceUnits.set([]);
        this.invoiceUnitsLoadError.set(this.i18n.translate('building.finance.noUnitsForCreate'));
        this.invoiceUnitsLoading.set(false);
      }
    });
  }

  loadSummary(): void {
    this.service.getSummary(this.buildingId()).subscribe({
      next: (summary) => this.summary.set(summary),
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? this.i18n.translate('building.finance.noLoadSummary'));
      }
    });
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filter = this.statusFilter() || undefined;
    this.service.getInvoices(this.buildingId(), this.pageIndex(), this.pageSize(), filter).subscribe({
      next: (response) => {
        this.invoices.set(response.content);
        this.totalElements.set(response.totalElements);
        this.pageIndex.set(response.pageable.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? this.i18n.translate('building.finance.noLoadInvoices'));
        this.loading.set(false);
      }
    });
  }

  createInvoice(): void {
    if (!this.canManageFinances()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (!this.selectedInvoiceCanBeBilled()) {
      this.errorMessage.set(this.i18n.translate('building.finance.unitNeedsRecipient'));
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let payload: BuildingFinanceInvoiceRequest;
    try {
      payload = this.buildInvoicePayload();
    } catch {
      this.errorMessage.set('Please enter dates in dd-MM-yyyy format.');
      return;
    }
    this.loading.set(true);

    this.service.createInvoice(this.buildingId(), payload).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.translate('building.finance.created'), this.i18n.translate('common.close'), { duration: 2500 });
        this.form.patchValue({
          unitId: null,
          description: '',
          amount: 0,
          extraFeeType: '',
          extraFeeLabel: '',
          extraFeeQuantity: 1,
          extraFeeUnitPrice: 0
        });
        this.form.controls.extraFeeLabel.enable({ emitEvent: false });
        this.extraFees.set([]);
        this.loadSummary();
        this.loadInvoices();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? this.i18n.translate('building.finance.noCreate'));
        this.loading.set(false);
      }
    });
  }

  generateInvoicesForAllUnits(): void {
    if (!this.canManageFinances()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (this.bulkForm.invalid) {
      this.bulkForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    let payload: BuildingBulkInvoiceGenerationRequest;
    try {
      payload = this.buildBulkPayload();
    } catch {
      this.errorMessage.set('Please enter dates in dd-MM-yyyy format.');
      this.loading.set(false);
      return;
    }

    this.service.generateInvoicesForAllUnits(this.buildingId(), payload).subscribe({
      next: (result: BuildingBulkInvoiceGenerationResult) => {
        this.snackBar.open(
          this.i18n.translate('building.finance.createdAll')
            .replace('{{created}}', String(result.createdInvoices))
            .replace('{{skipped}}', String(result.skippedUnits)),
          this.i18n.translate('common.close'),
          { duration: 3500 }
        );
        this.loadSummary();
        this.loadInvoices();
        this.bulkForm.patchValue({
          extraFeeType: '',
          extraFeeLabel: '',
          extraFeeQuantity: 1,
          extraFeeUnitPrice: 0
        });
        this.bulkForm.controls.extraFeeLabel.enable({ emitEvent: false });
        this.extraFeesBulk.set([]);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? this.i18n.translate('building.finance.noBulk'));
        this.loading.set(false);
      }
    });
  }

  markAsPaid(item: BuildingFinanceInvoice): void {
    if (!this.canManageFinances()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    this.loading.set(true);
    this.service.markAsPaid(this.buildingId(), item.id).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.translate('building.finance.markPaid'), this.i18n.translate('common.close'), { duration: 2500 });
        this.loadSummary();
        this.loadInvoices();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? this.i18n.translate('building.finance.noMarkPaid'));
        this.loading.set(false);
      }
    });
  }

  openInvoice(invoiceId: number): void {
    this.router.navigate(['/invoices', invoiceId]);
  }

  onStatusFilterChange(value: InvoiceStatus | ''): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadInvoices();
  }

  onApplyToAllUnitsToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.applyToAllUnits.set(input.checked);
    this.errorMessage.set('');
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadInvoices();
  }

  selectedInvoiceUnit(): BuildingUnit | null {
    const unitId = this.form.controls.unitId.value;
    return unitId == null ? null : this.invoiceUnits().find((unit) => unit.id === unitId) ?? null;
  }

  unitRecipientUserId(unit: BuildingUnit): number | null {
    return unit.tenantId ?? unit.ownerId ?? null;
  }

  unitInvoiceLabel(unit: BuildingUnit): string {
    return `${unit.unitNumber} — ${this.unitRecipientPreview(unit)}`;
  }

  unitRecipientPreview(unit: BuildingUnit): string {
    if (unit.tenantId) {
      return unit.tenantName || unit.tenantEmail || `Tenant #${unit.tenantId}`;
    }

    if (unit.ownerId) {
      return unit.ownerName || unit.ownerEmail || `Owner #${unit.ownerId}`;
    }

    return 'No owner or tenant assigned';
  }

  selectedInvoiceCanBeBilled(): boolean {
    const unit = this.selectedInvoiceUnit();
    return !!unit && !!this.unitRecipientUserId(unit);
  }

  private resolveBuildingDefaultMonthlyFee(property: any): number | null {
    const rawFee = property?.billing?.monthlyFee ?? property?.monthlyFee ?? null;
    const fee = rawFee != null ? Number(rawFee) : null;
    return fee != null && !Number.isNaN(fee) && fee > 0 ? fee : null;
  }

  resolveUnitBaseAmount(unit: BuildingUnit): number | null {
    const rawOverride = unit.monthlyFeeOverride;
    const override = rawOverride != null ? Number(rawOverride) : null;
    if (override != null && !Number.isNaN(override) && override > 0) {
      return override;
    }
    return this.buildingDefaultMonthlyFee();
  }

  readonly bulkPreviewRows = computed((): Array<{
    unitId: number;
    unitNumber: string;
    recipient: string;
    baseAmount: number | null;
    extrasAmount: number;
    projectedTotal: number | null;
    status: 'READY' | 'SKIPPED';
    reason?: string;
  }> => {
    const extras = this.bulkExtraFeesTotal();
    return this.invoiceUnits()
      .slice()
      .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true, sensitivity: 'base' }))
      .map((unit) => {
        const recipientId = this.unitRecipientUserId(unit);
        const base = this.resolveUnitBaseAmount(unit);

        if (!recipientId) {
          return {
            unitId: unit.id,
            unitNumber: unit.unitNumber,
            recipient: this.unitRecipientPreview(unit),
            baseAmount: base,
            extrasAmount: extras,
            projectedTotal: null,
            status: 'SKIPPED' as const,
            reason: 'Sem destinatario (owner/tenant).'
          };
        }

        if (base == null) {
          return {
            unitId: unit.id,
            unitNumber: unit.unitNumber,
            recipient: this.unitRecipientPreview(unit),
            baseAmount: null,
            extrasAmount: extras,
            projectedTotal: null,
            status: 'SKIPPED' as const,
            reason: 'Sem mensalidade configurada.'
          };
        }

        return {
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          recipient: this.unitRecipientPreview(unit),
          baseAmount: base,
          extrasAmount: extras,
          projectedTotal: base + extras,
          status: 'READY' as const
        };
      });
  });

  readonly bulkPreviewReadyCount = computed(() => this.bulkPreviewRows().filter((row) => row.status === 'READY').length);

  readonly bulkPreviewSkippedCount = computed(() => this.bulkPreviewRows().filter((row) => row.status === 'SKIPPED').length);

  onDateInput(formName: 'create' | 'bulk', controlName: 'dueDate' | 'referenceMonth', event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    const formatted = formatDateInput(input.value);
    input.value = formatted;

    const control = formName === 'create'
      ? this.form.controls[controlName]
      : this.bulkForm.controls[controlName];

    control.setValue(formatted);
    control.markAsDirty();
  }

  onDateKeyDown(event: KeyboardEvent): void {
    const allowedKeys = new Set([
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]);

    if (
      allowedKeys.has(event.key) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      /^\d$/.test(event.key) ||
      event.key === '-'
    ) {
      return;
    }

    event.preventDefault();
  }

  onDatePaste(formName: 'create' | 'bulk', controlName: 'dueDate' | 'referenceMonth', event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const formatted = formatDateInput(pasted);

    const control = formName === 'create'
      ? this.form.controls[controlName]
      : this.bulkForm.controls[controlName];

    control.setValue(formatted);
    control.markAsDirty();
    control.markAsTouched();
  }

  formatDisplayDate = formatDisplayDate;
  private parseDisplayDate = parseDisplayDate;

  addExtraFee(): void {
    const type = this.form.controls.extraFeeType.value;
    if (!type) {
      this.errorMessage.set('Selecione o tipo de custo extra antes de informar quantidade e valor unitario.');
      return;
    }
    const preset = this.extraFeePresets.find((item) => item.key === type);
    const label = preset ? preset.label : (this.form.controls.extraFeeLabel.value || '').trim();
    const quantity = Number(this.form.controls.extraFeeQuantity.value || 0);
    const unitPrice = Number(this.form.controls.extraFeeUnitPrice.value || 0);
    const amount = quantity * unitPrice;
    if (!label || quantity <= 0 || unitPrice <= 0) {
      this.errorMessage.set('Informe descricao, quantidade e valor unitario validos para o custo extra.');
      return;
    }

    this.extraFees.set([...this.extraFees(), { type: type || 'CUSTOM', label, quantity, unitPrice, amount }]);
    this.form.patchValue({ extraFeeType: '', extraFeeLabel: '', extraFeeQuantity: 1, extraFeeUnitPrice: 0 });
    this.form.controls.extraFeeLabel.enable({ emitEvent: false });
    this.errorMessage.set('');
  }

  onExtraFeeTypeChange(value: string): void {
    if (value === 'CUSTOM') {
      this.form.controls.extraFeeLabel.enable({ emitEvent: false });
      return;
    }

    if (!value) {
      this.form.controls.extraFeeLabel.enable({ emitEvent: false });
      this.form.patchValue({ extraFeeLabel: '' });
      return;
    }

    const preset = this.extraFeePresets.find((item) => item.key === value);
    if (preset) {
      this.form.patchValue({ extraFeeLabel: preset.label });
      this.form.controls.extraFeeLabel.disable({ emitEvent: false });
    }
  }

  addBulkExtraFee(): void {
    const type = this.bulkForm.controls.extraFeeType.value;
    if (!type) {
      this.errorMessage.set('Selecione o tipo de custo extra antes de informar quantidade e valor unitario.');
      return;
    }

    const preset = this.extraFeePresets.find((item) => item.key === type);
    const label = preset ? preset.label : (this.bulkForm.controls.extraFeeLabel.value || '').trim();
    const quantity = Number(this.bulkForm.controls.extraFeeQuantity.value || 0);
    const unitPrice = Number(this.bulkForm.controls.extraFeeUnitPrice.value || 0);
    const amount = quantity * unitPrice;
    if (!label || quantity <= 0 || unitPrice <= 0) {
      this.errorMessage.set('Informe descricao, quantidade e valor unitario validos para o custo extra.');
      return;
    }

    this.extraFeesBulk.set([...this.extraFeesBulk(), { type: type || 'CUSTOM', label, quantity, unitPrice, amount }]);
    this.bulkForm.patchValue({ extraFeeType: '', extraFeeLabel: '', extraFeeQuantity: 1, extraFeeUnitPrice: 0 });
    this.bulkForm.controls.extraFeeLabel.enable({ emitEvent: false });
    this.errorMessage.set('');
  }

  onBulkExtraFeeTypeChange(value: string): void {
    if (value === 'CUSTOM') {
      this.bulkForm.controls.extraFeeLabel.enable({ emitEvent: false });
      return;
    }

    if (!value) {
      this.bulkForm.controls.extraFeeLabel.enable({ emitEvent: false });
      this.bulkForm.patchValue({ extraFeeLabel: '' });
      return;
    }

    const preset = this.extraFeePresets.find((item) => item.key === value);
    if (preset) {
      this.bulkForm.patchValue({ extraFeeLabel: preset.label });
      this.bulkForm.controls.extraFeeLabel.disable({ emitEvent: false });
    }
  }

  removeBulkExtraFee(index: number): void {
    const current = this.extraFeesBulk();
    this.extraFeesBulk.set(current.filter((_, idx) => idx !== index));
  }

  bulkExtraFeesTotal(): number {
    return this.extraFeesBulk().reduce((sum, fee) => sum + fee.amount, 0);
  }

  removeExtraFee(index: number): void {
    const current = this.extraFees();
    this.extraFees.set(current.filter((_, idx) => idx !== index));
  }

  extraFeesTotal(): number {
    return this.extraFees().reduce((sum, fee) => sum + fee.amount, 0);
  }

  invoiceGrandTotal(): number {
    const base = Number(this.form.controls.amount.value || 0);
    return base + this.extraFeesTotal();
  }

  private buildInvoicePayload(): BuildingFinanceInvoiceRequest {
    const raw = this.form.getRawValue();
    const dueDate = this.parseDisplayDate(raw.dueDate);
    if (!dueDate) {
      throw new Error('Invalid due date');
    }

    const baseAmount = Number(raw.amount || 0);
    if (baseAmount <= 0) {
      throw new Error('Invalid amount');
    }

    const charges = this.extraFees().map((fee) => ({
      chargeType: fee.type,
      description: fee.label,
      quantity: fee.quantity,
      unitPrice: fee.unitPrice
    }));

    return {
      unitId: raw.unitId as number,
      amount: baseAmount,
      dueDate,
      referenceMonth: this.parseDisplayDate(raw.referenceMonth) ?? undefined,
      description: raw.description?.trim() || undefined,
      charges
    };
  }

  private buildBulkPayload(): BuildingBulkInvoiceGenerationRequest {
    const raw = this.bulkForm.getRawValue();
    const referenceMonth = this.parseDisplayDate(raw.referenceMonth);
    if (!referenceMonth) {
      throw new Error('Invalid reference month');
    }

    const charges = this.extraFeesBulk().map((fee) => ({
      chargeType: fee.type,
      description: fee.label,
      quantity: fee.quantity,
      unitPrice: fee.unitPrice
    }));

    return {
      referenceMonth,
      dueDate: this.parseDisplayDate(raw.dueDate) ?? undefined,
      description: raw.description?.trim() || undefined,
      charges
    };
  }

  private applyPendingUnitSelection(): void {
    if (this.pendingUnitId == null) {
      return;
    }

    const match = this.invoiceUnits().find((unit) => unit.id === this.pendingUnitId) ?? null;
    if (match) {
      this.form.patchValue({ unitId: match.id });
    }

    this.pendingUnitId = null;
  }

  markBulkPreviewStale(): void {
    this.bulkPreviewStale.set(true);
  }

  previewInvoicesForAllUnits(): void {
    if (!this.canManageFinances()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (this.bulkForm.invalid) {
      this.bulkForm.markAllAsTouched();
      return;
    }

    let payload: BuildingBulkInvoiceGenerationRequest;
    try {
      payload = this.buildBulkPayload();
    } catch {
      this.errorMessage.set('Please enter dates in dd-MM-yyyy format.');
      return;
    }

    this.bulkPreviewLoading.set(true);
    this.errorMessage.set('');

    this.service.previewInvoicesForAllUnits(this.buildingId(), payload).subscribe({
      next: (preview) => {
        this.bulkPreview.set(preview);
        this.bulkPreviewStale.set(false);
        this.bulkPreviewLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? this.i18n.translate('building.finance.noBulk'));
        this.bulkPreviewLoading.set(false);
      }
    });
  }

  bulkPreviewCompactItems(): BuildingBulkInvoicePreviewItem[] {
    const preview = this.bulkPreview();
    if (!preview) {
      return [];
    }
    return preview.items.slice(0, this.bulkPreviewLimit);
  }
}
