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
  WorkOrder,
  WorkOrderPriority,
  WorkOrderRequest,
  WorkOrderStatus,
  WorkOrderStatusUpdateRequest
} from '../../../models/building/work-order.model';
import { WorkOrderService } from '../../../services/building/work-order.service';
import { BuildingAlertEvent, BuildingRealtimeService } from '../../../services/building/building-realtime.service';
import { PropertyService } from '../../../services/property.service';
import { I18nService } from '../../../services/i18n.service';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';

@Component({
  selector: 'app-building-work-orders',
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
          <h1 class="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p class="text-sm text-slate-600">Track maintenance workflow and update status in real time.</p>
        </div>
        <a [routerLink]="['/property', buildingId()]" mat-stroked-button>Back to Property</a>
      </div>

      <mat-card class="mb-6 p-4">
        @if (canCreateWorkOrders() && !canManageWorkOrders()) {
          <p class="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {{ i18n.translate('building.workOrders.requesterNotice') }}
          </p>
        }
        @if (canCreateWorkOrders()) {
        <h2 class="mb-4 text-lg font-semibold">Create Work Order</h2>
        <form [formGroup]="form" (ngSubmit)="createWorkOrder()" class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>

          @if (canManageWorkOrders()) {
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Assigned To</mat-label>
            <input matInput formControlName="assignedTo" />
          </mat-form-field>
          }

          <mat-form-field appearance="outline" class="md:col-span-4">
            <mat-label>Description</mat-label>
            <textarea matInput rows="3" formControlName="description"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              @for (priority of priorities; track priority) {
                <mat-option [value]="priority">{{ priority }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (canManageWorkOrders()) {
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                @for (status of statuses; track status) {
                  <mat-option [value]="status">{{ status }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estimated Cost</mat-label>
              <input matInput type="number" formControlName="estimatedCost" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Vendor</mat-label>
              <input matInput formControlName="vendorName" />
            </mat-form-field>
          }

          <div class="md:col-span-4 flex justify-end">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              Create Work Order
            </button>
          </div>
        </form>
        }
      </mat-card>

      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Work Orders ({{ totalElements() }})</h2>
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
            <button mat-stroked-button (click)="loadWorkOrders()" [disabled]="loading()">Refresh</button>
          </div>
        </div>

        @if (errorMessage()) {
          <p class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        @if (loading()) {
          <p class="text-sm text-slate-500">Loading work orders...</p>
        }

        @if (!loading()) {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="workOrders()" class="w-full">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let row">{{ row.title }}</td>
              </ng-container>

              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Priority</th>
                <td mat-cell *matCellDef="let row">{{ row.priority }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">{{ row.status }}</td>
              </ng-container>

              <ng-container matColumnDef="assignedTo">
                <th mat-header-cell *matHeaderCellDef>Assigned</th>
                <td mat-cell *matCellDef="let row">{{ row.assignedTo || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button (click)="advanceStatus(row)" [disabled]="!canManageWorkOrders() || !canAdvance(row.status)">
                    <mat-icon>sync</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteWorkOrder(row)" [disabled]="!canManageWorkOrders()">
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
export class BuildingWorkOrdersComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly workOrderService = inject(WorkOrderService);
  private readonly propertyService = inject(PropertyService);
  readonly i18n = inject(I18nService);
  private readonly realtimeService = inject(BuildingRealtimeService);
  private readonly snackBar = inject(MatSnackBar);
  private alertSubscription: Subscription | null = null;

  readonly buildingId = signal<number>(0);
  readonly workOrders = signal<WorkOrder[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly statusFilter = signal<WorkOrderStatus | ''>('');
  readonly canCreateWorkOrders = signal<boolean>(false);
  readonly canManageWorkOrders = signal<boolean>(false);

  readonly priorities: WorkOrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  readonly statuses: WorkOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
  readonly displayedColumns: string[] = ['title', 'priority', 'status', 'assignedTo', 'actions'];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: ['MEDIUM' as WorkOrderPriority, Validators.required],
    status: ['OPEN' as WorkOrderStatus, Validators.required],
    estimatedCost: [null as number | null],
    assignedTo: [''],
    vendorName: ['']
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id')
      ?? this.route.parent?.snapshot.paramMap.get('id')
      ?? '0';
    this.buildingId.set(Number(rawId));

    this.realtimeService.connectToBuildingAlerts(this.buildingId());
    this.alertSubscription = this.realtimeService.events$().subscribe((event) => this.onRealtimeEvent(event));

    this.loadAccessProfile();
    this.loadWorkOrders();
  }

  ngOnDestroy(): void {
    this.alertSubscription?.unsubscribe();
    this.alertSubscription = null;
    this.realtimeService.disconnect();
  }

  loadWorkOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filter = this.statusFilter() || undefined;
    this.workOrderService.getWorkOrders(this.buildingId(), this.pageIndex(), this.pageSize(), filter).subscribe({
      next: (response) => {
        this.workOrders.set(response.content);
        this.totalElements.set(response.totalElements);
        this.pageIndex.set(response.pageable.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not load work orders.');
        this.loading.set(false);
      }
    });
  }

  createWorkOrder(): void {
    if (!this.canCreateWorkOrders()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: WorkOrderRequest = {
      ...raw,
      // Residents can open requests, but status/assignment is handled by operation roles.
      status: this.canManageWorkOrders() ? raw.status : 'OPEN',
      estimatedCost: this.canManageWorkOrders() ? raw.estimatedCost : null,
      assignedTo: this.canManageWorkOrders() ? raw.assignedTo : '',
      vendorName: this.canManageWorkOrders() ? raw.vendorName : ''
    };
    this.loading.set(true);

    this.workOrderService.createWorkOrder(this.buildingId(), payload).subscribe({
      next: () => {
        this.snackBar.open('Work order created.', 'Close', { duration: 2500 });
        this.form.patchValue({ title: '', description: '', estimatedCost: null, assignedTo: '', vendorName: '' });
        this.loadWorkOrders();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not create work order.');
        this.loading.set(false);
      }
    });
  }

  deleteWorkOrder(item: WorkOrder): void {
    if (!this.canManageWorkOrders()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (!confirm(`Delete work order "${item.title}"?`)) {
      return;
    }

    this.loading.set(true);
    this.workOrderService.deleteWorkOrder(this.buildingId(), item.id).subscribe({
      next: () => {
        this.snackBar.open('Work order deleted.', 'Close', { duration: 2500 });
        this.loadWorkOrders();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not delete work order.');
        this.loading.set(false);
      }
    });
  }

  onStatusFilterChange(value: WorkOrderStatus | ''): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadWorkOrders();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadWorkOrders();
  }

  canAdvance(status: WorkOrderStatus): boolean {
    return status !== 'COMPLETED' && status !== 'CANCELLED';
  }

  advanceStatus(item: WorkOrder): void {
    if (!this.canManageWorkOrders()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    const nextStatus = this.getNextStatus(item.status);
    if (!nextStatus) {
      return;
    }

    const payload: WorkOrderStatusUpdateRequest = {
      status: nextStatus,
      note: 'Updated from UI'
    };

    this.loading.set(true);
    this.workOrderService.updateWorkOrderStatus(this.buildingId(), item.id, payload).subscribe({
      next: () => {
        this.snackBar.open(`Status updated to ${nextStatus}.`, 'Close', { duration: 2500 });
        this.loadWorkOrders();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not update status.');
        this.loading.set(false);
      }
    });
  }

  private getNextStatus(status: WorkOrderStatus): WorkOrderStatus | null {
    switch (status) {
      case 'OPEN':
        return 'IN_PROGRESS';
      case 'IN_PROGRESS':
        return 'COMPLETED';
      case 'ON_HOLD':
        return 'IN_PROGRESS';
      default:
        return null;
    }
  }

  private loadAccessProfile(): void {
    this.propertyService.getPropertyById(this.buildingId()).subscribe({
      next: (property) => {
        const hasPropertyRole = !!property.currentUserRole;
        this.canCreateWorkOrders.set(hasPropertyRole);
        this.canManageWorkOrders.set(canManageBuildingOperations(property.currentUserRole));
      },
      error: () => {
        this.canCreateWorkOrders.set(false);
        this.canManageWorkOrders.set(false);
      }
    });
  }

  private onRealtimeEvent(event: BuildingAlertEvent): void {
    if (event.buildingId !== this.buildingId()) {
      return;
    }

    if (event.type === 'work-order-created' || event.type === 'work-order-status-changed') {
      this.snackBar.open('Work order update received.', 'Close', { duration: 2500 });
      this.loadWorkOrders();
    }
  }
}


