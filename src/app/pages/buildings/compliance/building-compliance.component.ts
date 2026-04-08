import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
import { Subscription } from 'rxjs';
import {
  ComplianceItem,
  ComplianceItemRequest,
  ComplianceStatus
} from '../../../models/building/compliance-item.model';
import { ComplianceItemService } from '../../../services/building/compliance-item.service';
import { BuildingAlertEvent, BuildingRealtimeService } from '../../../services/building/building-realtime.service';
import { PropertyService } from '../../../services/property.service';
import { I18nService } from '../../../services/i18n.service';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';

@Component({
  selector: 'app-building-compliance',
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
          <h1 class="text-2xl font-bold text-slate-900">Compliance Items</h1>
          <p class="text-sm text-slate-600">Track inspections, certificates, and deadline reminders.</p>
        </div>
        <a [routerLink]="['/property', buildingId()]" mat-stroked-button>Back to Property</a>
      </div>

      <mat-card class="mb-6 p-4">
        @if (!canManageCompliance()) {
          <p class="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {{ i18n.translate('building.access.readOnlyNotice') }}
          </p>
        }
        @if (canManageCompliance()) {
        <h2 class="mb-4 text-lg font-semibold">Create Compliance Item</h2>
        <form [formGroup]="form" (ngSubmit)="createComplianceItem()" class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Authority</mat-label>
            <input matInput formControlName="authority" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Due Date</mat-label>
            <input matInput type="date" formControlName="dueDate" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (status of statuses; track status) {
                <mat-option [value]="status">{{ status }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Reminder Days Before</mat-label>
            <input matInput type="number" formControlName="reminderDaysBefore" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Failed Reason</mat-label>
            <input matInput formControlName="failedReason" />
          </mat-form-field>

          <div class="md:col-span-4 flex justify-end">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              Create Compliance Item
            </button>
          </div>
        </form>
        }
      </mat-card>

      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Compliance Items ({{ totalElements() }})</h2>
          <div class="flex items-center gap-2">
            <mat-form-field appearance="outline" class="w-48">
              <mat-label>Status Filter</mat-label>
              <mat-select [value]="statusFilter()" (selectionChange)="onStatusFilterChange($event.value)">
                <mat-option value="">All</mat-option>
                @for (status of statuses; track status) {
                  <mat-option [value]="status">{{ status }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <button mat-stroked-button (click)="loadComplianceItems()" [disabled]="loading()">Refresh</button>
          </div>
        </div>

        @if (errorMessage()) {
          <p class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        @if (loading()) {
          <p class="text-sm text-slate-500">Loading compliance items...</p>
        }

        @if (!loading()) {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="items()" class="w-full">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let row">{{ row.title }}</td>
              </ng-container>

              <ng-container matColumnDef="authority">
                <th mat-header-cell *matHeaderCellDef>Authority</th>
                <td mat-cell *matCellDef="let row">{{ row.authority }}</td>
              </ng-container>

              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>Due Date</th>
                <td mat-cell *matCellDef="let row">{{ row.dueDate }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">{{ row.status }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="warn" (click)="deleteComplianceItem(row)" [disabled]="!canManageCompliance()">
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
        }
      </mat-card>
    </div>
  `
})
export class BuildingComplianceComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly complianceService = inject(ComplianceItemService);
  private readonly propertyService = inject(PropertyService);
  readonly i18n = inject(I18nService);
  private readonly realtimeService = inject(BuildingRealtimeService);
  private readonly snackBar = inject(MatSnackBar);
  private alertSubscription: Subscription | null = null;

  readonly buildingId = signal<number>(0);
  readonly items = signal<ComplianceItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly statusFilter = signal<ComplianceStatus | ''>('');
  readonly canManageCompliance = signal<boolean>(false);

  readonly statuses: ComplianceStatus[] = ['PENDING', 'PASSED', 'FAILED', 'EXPIRED'];
  readonly displayedColumns: string[] = ['title', 'authority', 'dueDate', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    authority: ['', [Validators.required, Validators.maxLength(150)]],
    dueDate: ['', Validators.required],
    status: ['PENDING' as ComplianceStatus, Validators.required],
    reminderDaysBefore: [7],
    failedReason: ['']
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id')
      ?? this.route.parent?.snapshot.paramMap.get('id')
      ?? '0';
    this.buildingId.set(Number(rawId));

    this.realtimeService.connectToBuildingAlerts(this.buildingId());
    this.alertSubscription = this.realtimeService.events$().subscribe((event) => this.onRealtimeEvent(event));

    this.loadAccessProfile();
    this.loadComplianceItems();
  }

  ngOnDestroy(): void {
    this.alertSubscription?.unsubscribe();
    this.alertSubscription = null;
    this.realtimeService.disconnect();
  }

  loadComplianceItems(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filter = this.statusFilter() || undefined;
    this.complianceService.getComplianceItems(this.buildingId(), this.pageIndex(), this.pageSize(), filter).subscribe({
      next: (response) => {
        this.items.set(response.content);
        this.totalElements.set(response.totalElements);
        this.pageIndex.set(response.pageable.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not load compliance items.');
        this.loading.set(false);
      }
    });
  }

  createComplianceItem(): void {
    if (!this.canManageCompliance()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as ComplianceItemRequest;
    this.loading.set(true);

    this.complianceService.createComplianceItem(this.buildingId(), payload).subscribe({
      next: () => {
        this.snackBar.open('Compliance item created.', 'Close', { duration: 2500 });
        this.form.patchValue({ title: '', authority: '', dueDate: '', failedReason: '' });
        this.loadComplianceItems();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not create compliance item.');
        this.loading.set(false);
      }
    });
  }

  deleteComplianceItem(item: ComplianceItem): void {
    if (!this.canManageCompliance()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (!confirm(`Delete compliance item "${item.title}"?`)) {
      return;
    }

    this.loading.set(true);
    this.complianceService.deleteComplianceItem(this.buildingId(), item.id).subscribe({
      next: () => {
        this.snackBar.open('Compliance item deleted.', 'Close', { duration: 2500 });
        this.loadComplianceItems();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not delete compliance item.');
        this.loading.set(false);
      }
    });
  }

  onStatusFilterChange(value: ComplianceStatus | ''): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadComplianceItems();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadComplianceItems();
  }

  private onRealtimeEvent(event: BuildingAlertEvent): void {
    if (event.buildingId !== this.buildingId()) {
      return;
    }

    if (event.type === 'compliance-item-created' || event.type === 'compliance-item-updated' || event.type === 'compliance-reminder-due') {
      this.snackBar.open('Compliance update received.', 'Close', { duration: 2500 });
      this.loadComplianceItems();
    }
  }

  private loadAccessProfile(): void {
    this.propertyService.getPropertyById(this.buildingId()).subscribe({
      next: (property) => this.canManageCompliance.set(canManageBuildingOperations(property.currentUserRole)),
      error: () => this.canManageCompliance.set(false)
    });
  }
}

