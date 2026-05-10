import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { BuildingUserManagementService } from '../../../services/building/building-user-management.service';
import { I18nService } from '../../../services/i18n.service';
import { PropertyService } from '../../../services/property.service';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';
import {
  BuildingUser,
  UnitRoleAssignment
} from '../../../models/building-user.model';

const ROLE_OPTIONS: UnitRoleAssignment[] = ['OWNER', 'TENANT', 'UNIT_MANAGER', 'SUBTENANT'];

@Component({
  selector: 'app-building-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.users.title') }}</h1>
          <p class="text-sm text-slate-600">{{ i18n.translate('building.users.subtitle') }}</p>
        </div>
        <a [routerLink]="['/property', buildingId()]" mat-stroked-button>
          {{ i18n.translate('building.workOrders.backToProperty') }}
        </a>
      </div>

      @if (!canManage()) {
        <p class="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {{ i18n.translate('building.access.readOnlyNotice') }}
        </p>
      }

      @if (canManage()) {
        <mat-card class="mb-6 p-4">
          <h2 class="mb-4 text-lg font-semibold">{{ i18n.translate('building.users.actionsTitle') }}</h2>
          <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <mat-form-field appearance="outline">
              <mat-label>{{ i18n.translate('building.users.action') }}</mat-label>
              <mat-select formControlName="action">
                <mat-option value="addTenant">{{ i18n.translate('building.users.actions.addTenant') }}</mat-option>
                <mat-option value="removeTenant">{{ i18n.translate('building.users.actions.removeTenant') }}</mat-option>
                <mat-option value="addOwner">{{ i18n.translate('building.users.actions.addOwner') }}</mat-option>
                <mat-option value="removeOwner">{{ i18n.translate('building.users.actions.removeOwner') }}</mat-option>
                <mat-option value="assignRole">{{ i18n.translate('building.users.actions.assignRole') }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ i18n.translate('building.users.unit') }}</mat-label>
              <mat-select formControlName="unitId">
                @for (u of unitOptions(); track u.unitId) {
                  <mat-option [value]="u.unitId">{{ u.unitNumber }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ i18n.translate('building.users.email') }}</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>

            @if (form.controls.action.value === 'assignRole') {
              <mat-form-field appearance="outline">
                <mat-label>{{ i18n.translate('building.users.role') }}</mat-label>
                <mat-select formControlName="role">
                  @for (role of roles; track role) {
                    <mat-option [value]="role">{{ i18n.translate('building.users.roles.' + role) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            @if (form.controls.action.value === 'addTenant') {
              <mat-form-field appearance="outline">
                <mat-label>{{ i18n.translate('building.users.primary') }}</mat-label>
                <mat-select formControlName="primary">
                  <mat-option [value]="true">{{ i18n.translate('common.yes') }}</mat-option>
                  <mat-option [value]="false">{{ i18n.translate('common.no') }}</mat-option>
                </mat-select>
              </mat-form-field>
            }

            @if (form.controls.action.value === 'removeOwner') {
              <mat-form-field appearance="outline">
                <mat-label>{{ i18n.translate('building.users.allowPrimaryRemoval') }}</mat-label>
                <mat-select formControlName="allowPrimaryRemoval">
                  <mat-option [value]="false">{{ i18n.translate('common.no') }}</mat-option>
                  <mat-option [value]="true">{{ i18n.translate('common.yes') }}</mat-option>
                </mat-select>
              </mat-form-field>
            }

            <div class="md:col-span-4 flex justify-end">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
                {{ i18n.translate('building.users.submit') }}
              </button>
            </div>
          </form>
          @if (errorMessage()) {
            <p class="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ errorMessage() }}
            </p>
          }
        </mat-card>
      }

      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ i18n.translate('building.users.list') }} ({{ users().length }})
          </h2>
          <button mat-stroked-button (click)="loadUsers()" [disabled]="loading()">
            {{ i18n.translate('common.refresh') }}
          </button>
        </div>

        @if (loading()) {
          <p class="text-sm text-slate-500">{{ i18n.translate('common.loading') }}</p>
        } @else if (users().length === 0) {
          <p class="text-sm text-slate-500">{{ i18n.translate('building.users.empty') }}</p>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="users()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.users.name') }}</th>
                <td mat-cell *matCellDef="let row">
                  <div class="font-medium">{{ row.fullName }}</div>
                  <div class="text-xs text-slate-500">{{ row.email }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="roles">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.users.buildingRoles') }}</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip-listbox aria-label="roles">
                    @for (role of row.buildingRoles; track role) {
                      <mat-chip-option [selectable]="false">{{ role }}</mat-chip-option>
                    }
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <ng-container matColumnDef="units">
                <th mat-header-cell *matHeaderCellDef>{{ i18n.translate('building.users.units') }}</th>
                <td mat-cell *matCellDef="let row">
                  @for (u of row.units; track u.unitId) {
                    <div class="text-sm">
                      <span class="font-medium">{{ u.unitNumber }}</span>
                      <span class="ml-1 text-xs text-slate-500">({{ u.memberships.join(', ') }})</span>
                    </div>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        }
      </mat-card>
    </div>
  `
})
export class BuildingUsersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BuildingUserManagementService);
  private readonly propertyService = inject(PropertyService);
  private readonly snackBar = inject(MatSnackBar);
  readonly i18n = inject(I18nService);

  readonly buildingId = signal<number>(0);
  readonly users = signal<BuildingUser[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string>('');
  readonly canManage = signal<boolean>(false);

  readonly displayedColumns = ['name', 'roles', 'units'];
  readonly roles = ROLE_OPTIONS;

  readonly unitOptions = computed(() => {
    const map = new Map<number, { unitId: number; unitNumber: string }>();
    for (const u of this.users()) {
      for (const unit of u.units) {
        if (!map.has(unit.unitId)) {
          map.set(unit.unitId, { unitId: unit.unitId, unitNumber: unit.unitNumber });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
  });

  readonly form = this.fb.nonNullable.group({
    action: ['addTenant' as 'addTenant' | 'removeTenant' | 'addOwner' | 'removeOwner' | 'assignRole', Validators.required],
    unitId: [null as number | null, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['TENANT' as UnitRoleAssignment, Validators.required],
    primary: [false],
    allowPrimaryRemoval: [false]
  });

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
        ?? this.route.snapshot.paramMap.get('buildingId')
        ?? 0
    );
    this.buildingId.set(id);
    this.loadAccessProfile();
    this.loadUsers();
  }

  loadAccessProfile(): void {
    this.propertyService.getPropertyById(this.buildingId()).subscribe({
      next: (property) => this.canManage.set(canManageBuildingOperations(property.currentUserRole)),
      error: () => this.canManage.set(false)
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.service.listBuildingUsers(this.buildingId()).subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? this.i18n.translate('building.users.errorLoad'));
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (!this.canManage()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (!value.unitId) {
      return;
    }
    const buildingId = this.buildingId();
    this.loading.set(true);

    this.dispatch(buildingId, value).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.translate('building.users.success'), 'OK', { duration: 2500 });
        this.loadUsers();
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(err?.error?.message ?? this.i18n.translate('building.users.errorAction'));
        this.loading.set(false);
      }
    });
  }

  private dispatch(buildingId: number, value: ReturnType<typeof this.form.getRawValue>): Observable<unknown> {
    const unitId = value.unitId as number;
    switch (value.action) {
      case 'addTenant':
        return this.service.addTenant(buildingId, unitId, {
          email: value.email,
          primary: value.primary
        });
      case 'removeTenant':
        return this.service.removeTenant(buildingId, unitId, { email: value.email });
      case 'addOwner':
        return this.service.addOwner(buildingId, unitId, { email: value.email });
      case 'removeOwner':
        return this.service.removeOwner(
          buildingId,
          unitId,
          { email: value.email },
          value.allowPrimaryRemoval
        );
      case 'assignRole':
        return this.service.assignRole(buildingId, unitId, {
          email: value.email,
          role: value.role
        });
    }
  }
}
