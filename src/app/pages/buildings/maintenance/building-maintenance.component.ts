import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaintenanceService } from '../../../services/maintenance.service';
import { I18nService } from '../../../services/i18n.service';
import { MaintenanceRequest } from '../../../models/maintenance.model';

@Component({
  selector: 'app-building-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate(titleKey()) }}</h1>
          <p class="text-sm text-slate-600">
            {{ i18n.translate(subtitleKey()) }}
          </p>
        </div>
        <a [routerLink]="['/property', buildingId()]" mat-stroked-button>
          {{ i18n.translate('building.workOrders.backToProperty') }}
        </a>
      </div>

      @if (showCreate()) {
        <mat-card class="mb-6 p-4">
          <h2 class="mb-4 text-lg font-semibold">
            {{ i18n.translate('maintenance.building.createTitle') }}
          </h2>
          <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>{{ i18n.translate('maintenance.field.title') }}</mat-label>
              <input matInput formControlName="title" maxlength="200" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>{{ i18n.translate('maintenance.field.description') }}</mat-label>
              <textarea matInput rows="3" formControlName="description"></textarea>
            </mat-form-field>

            <div class="md:col-span-2 flex justify-end">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
                {{ i18n.translate('maintenance.building.create') }}
              </button>
            </div>
          </form>
        </mat-card>
      }

      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ i18n.translate(historyTitleKey()) }} ({{ totalElements() }})
          </h2>
          <button mat-stroked-button (click)="loadList()" [disabled]="loading()">
            {{ i18n.translate('maintenance.refresh') }}
          </button>
        </div>

        @if (errorMessage()) {
          <p class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage() }}
          </p>
        }

        @if (loading()) {
          <p class="text-sm text-slate-500">{{ i18n.translate('common.loading') }}</p>
        } @else if (items().length === 0) {
          <p class="text-sm text-slate-500">{{ i18n.translate('maintenance.empty') }}</p>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="items()" class="w-full">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('maintenance.field.title') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.title || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('maintenance.field.status') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.status }}</td>
              </ng-container>

              <ng-container matColumnDef="unit">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('maintenance.field.unit') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.unitId ?? '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('maintenance.field.createdAt') }}</th>
                <td mat-cell *matCellDef="let row">{{ row.createdAt | date: 'short' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalElements()"
            [pageIndex]="pageIndex()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
          />
        }
      </mat-card>
    </div>
  `
})
export class BuildingMaintenanceComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MaintenanceService);
  private readonly snackBar = inject(MatSnackBar);
  readonly i18n = inject(I18nService);

  readonly buildingId = signal<number>(0);
  readonly unitId = signal<number>(0);
  readonly items = signal<MaintenanceRequest[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(20);
  readonly totalElements = signal<number>(0);
  readonly mode = signal<'create' | 'history'>('create');

  readonly displayedColumns = ['title', 'status', 'unit', 'createdAt'];

  readonly showCreate = computed(() => this.mode() === 'create');
  readonly isUnitScoped = computed(() => this.unitId() > 0);

  readonly titleKey = computed(() => {
    if (this.mode() === 'create') {
      return 'maintenance.building.title';
    }
    return this.isUnitScoped() ? 'maintenance.unit.buildingTitle' : 'maintenance.history.title';
  });

  readonly subtitleKey = computed(() =>
    this.isUnitScoped() ? 'maintenance.unit.buildingSubtitle' : 'maintenance.building.subtitle'
  );

  readonly historyTitleKey = computed(() =>
    this.isUnitScoped() ? 'maintenance.unit.buildingHistoryTitle' : 'maintenance.history.title'
  );

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['']
  });

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
        ?? this.route.snapshot.paramMap.get('buildingId')
        ?? this.route.parent?.snapshot.paramMap.get('id')
        ?? this.route.parent?.snapshot.paramMap.get('buildingId')
        ?? 0
    );
    this.buildingId.set(id);
    this.unitId.set(Number(this.route.snapshot.paramMap.get('unitId') || 0));
    const data = this.route.snapshot.data;
    this.mode.set(data['historyOnly'] ? 'history' : 'create');
    this.loadList();
  }

  loadList(): void {
    if (!this.buildingId()) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');

    const request$ = this.unitId() > 0
      ? this.service.listBuildingMaintenanceForUnit(this.buildingId(), this.unitId(), this.pageIndex(), this.pageSize())
      : this.service.listBuildingMaintenance(this.buildingId(), this.pageIndex(), this.pageSize());

    request$.subscribe({
      next: (page) => {
        this.items.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? this.i18n.translate('maintenance.error.load'));
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.loading.set(true);
    this.service
      .createBuildingMaintenance(this.buildingId(), {
        title: value.title,
        description: value.description || undefined,
        unitId: this.unitId() > 0 ? this.unitId() : undefined
      })
      .subscribe({
        next: () => {
          this.snackBar.open(this.i18n.translate('maintenance.created'), 'OK', { duration: 2500 });
          this.form.reset({ title: '', description: '' });
          this.pageIndex.set(0);
          this.loadList();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message ?? this.i18n.translate('maintenance.error.create'));
          this.loading.set(false);
        }
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadList();
  }
}
