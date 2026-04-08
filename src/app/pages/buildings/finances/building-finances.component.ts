import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  BuildingFinanceInvoice,
  BuildingFinanceInvoiceRequest,
  BuildingFinanceSummary,
  InvoiceStatus
} from '../../../models/building/building-finance.model';
import { BuildingFinanceService } from '../../../services/building/building-finance.service';
import { I18nService } from '../../../services/i18n.service';
import { PropertyService } from '../../../services/property.service';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';

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
        <h2 class="mb-4 text-lg font-semibold">{{ i18n.translate('building.finance.createInvoice') }}</h2>
        <form [formGroup]="form" (ngSubmit)="createInvoice()" class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.userId') }}</mat-label>
            <input matInput type="number" formControlName="userId" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.amount') }}</mat-label>
            <input matInput type="number" formControlName="amount" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.dueDate') }}</mat-label>
            <input matInput type="date" formControlName="dueDate" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.referenceMonth') }}</mat-label>
            <input matInput type="date" formControlName="referenceMonth" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-4">
            <mat-label>{{ i18n.translate('building.finance.description') }}</mat-label>
            <input matInput formControlName="description" />
          </mat-form-field>

          <div class="md:col-span-4 flex justify-end">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">{{ i18n.translate('building.finance.createInvoice') }}</button>
          </div>
        </form>
      </mat-card>

      <mat-card class="mb-6 p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">{{ i18n.translate('building.finance.generateAllTitle') }}</h2>
            <p class="text-sm text-slate-500">{{ i18n.translate('building.finance.generateAllDesc') }}</p>
          </div>
          <button mat-stroked-button color="primary" type="button" (click)="generateInvoicesForAllUnits()" [disabled]="loading()">
            {{ i18n.translate('building.finance.generateAllButton') }}
          </button>
        </div>

        <form [formGroup]="bulkForm" class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.referenceMonthRequired') }}</mat-label>
            <input matInput type="date" formControlName="referenceMonth" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ i18n.translate('building.finance.dueDateOptional') }}</mat-label>
            <input matInput type="date" formControlName="dueDate" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-3">
            <mat-label>{{ i18n.translate('building.finance.descriptionOptional') }}</mat-label>
            <input matInput formControlName="description" [placeholder]="i18n.translate('building.finance.description')" />
          </mat-form-field>
        </form>
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
                <td mat-cell *matCellDef="let row">{{ row.invoiceNumber || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let row">{{ row.totalAmount ?? row.amount }}</td>
              </ng-container>

              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.finance.dueDate') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.dueDate }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.finance.statusFilter') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.status || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.finance.actions') }}</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="primary" (click)="markAsPaid(row)" [disabled]="row.status === 'PAID'">
                    <mat-icon>payments</mat-icon>
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
        }
      </mat-card>

      }
    </div>
  `
})
export class BuildingFinancesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BuildingFinanceService);
  private readonly propertyService = inject(PropertyService);
  private readonly snackBar = inject(MatSnackBar);
  readonly i18n = inject(I18nService);

  readonly buildingId = signal<number>(0);
  readonly invoices = signal<BuildingFinanceInvoice[]>([]);
  readonly summary = signal<BuildingFinanceSummary | null>(null);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly statusFilter = signal<InvoiceStatus | ''>('');
  readonly canManageFinances = signal<boolean>(false);

  readonly statuses: InvoiceStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];
  readonly displayedColumns: string[] = ['invoiceNumber', 'amount', 'dueDate', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    userId: [0, Validators.required],
    amount: [0, Validators.required],
    dueDate: ['', Validators.required],
    referenceMonth: [''],
    description: ['']
  });

  readonly bulkForm = this.fb.nonNullable.group({
    referenceMonth: ['', Validators.required],
    dueDate: [''],
    description: ['']
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id')
      ?? this.route.parent?.snapshot.paramMap.get('id')
      ?? '0';
    this.buildingId.set(Number(rawId));
    this.loadAccessProfile();
  }

  private loadAccessProfile(): void {
    this.propertyService.getPropertyById(this.buildingId()).subscribe({
      next: (property) => {
        const canManage = canManageBuildingOperations(property.currentUserRole);
        this.canManageFinances.set(canManage);
        if (canManage) {
          this.loadSummary();
          this.loadInvoices();
        }
      },
      error: () => {
        this.canManageFinances.set(false);
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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as BuildingFinanceInvoiceRequest;
    this.loading.set(true);

    this.service.createInvoice(this.buildingId(), payload).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.translate('building.finance.created'), this.i18n.translate('common.close'), { duration: 2500 });
        this.form.patchValue({ description: '', amount: 0 });
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
    const payload = this.bulkForm.getRawValue() as BuildingBulkInvoiceGenerationRequest;

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

  onStatusFilterChange(value: InvoiceStatus | ''): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadInvoices();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadInvoices();
  }
}

