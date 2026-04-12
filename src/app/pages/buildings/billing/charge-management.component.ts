import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChargeService, ChargeTypeService } from '../../../services/billing';
import {
  ChargeApprovalRequest,
  ChargeResponse,
  ChargeTypeResponse,
  ChargeRequest
} from '../../../models/billing';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-charge-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.billing.charge.title') }}</h1>
        <a [routerLink]="['/property', propertyId(), 'billing']" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.backToBilling') }}</a>
      </div>

      @if (errorMessage()) {
        <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      }

      <section class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">{{ i18n.translate('building.billing.charge.createTitle') }}</h2>
        <form [formGroup]="form" (ngSubmit)="createCharge()" class="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select formControlName="chargeTypeId" class="rounded border border-slate-300 px-3 py-2 text-sm">
            <option [ngValue]="null">{{ i18n.translate('building.billing.charge.selectType') }}</option>
            @for (type of chargeTypes(); track type.id) {
              <option [ngValue]="type.id">{{ type.name }}</option>
            }
          </select>
          <input type="number" formControlName="tenantUserId" [placeholder]="i18n.translate('building.billing.charge.tenantUserId')" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" formControlName="createdByUserId" [placeholder]="'Created by user ID'" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" formControlName="amount" [placeholder]="i18n.translate('building.billing.charge.amount')" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" formControlName="startDate" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" class="md:col-span-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" [disabled]="form.invalid">{{ i18n.translate('building.billing.charge.create') }}</button>
        </form>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ i18n.translate('building.billing.charge.listTitle') }} ({{ charges().length }})</h2>
          <button type="button" (click)="loadCharges()" class="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.common.refresh') }}</button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left text-slate-500">
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.id') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.charge.type') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.tenant') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.amount') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.status') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.charge.approval') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of charges(); track item.id) {
                <tr class="border-b border-slate-100">
                  <td class="px-2 py-2">{{ item.id }}</td>
                  <td class="px-2 py-2">{{ item.chargeTypeName }}</td>
                  <td class="px-2 py-2">{{ item.tenantUserId }}</td>
                  <td class="px-2 py-2">{{ item.amount }} {{ item.currency }}</td>
                  <td class="px-2 py-2">{{ item.chargeStatus }}</td>
                  <td class="px-2 py-2">{{ item.approvalStatus }}</td>
                  <td class="px-2 py-2">
                    <div class="flex gap-2">
                      <button type="button" (click)="approve(item.id)" class="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">{{ i18n.translate('building.billing.charge.approve') }}</button>
                      <button type="button" (click)="reject(item.id)" class="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">{{ i18n.translate('building.billing.charge.reject') }}</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
})
export class ChargeManagementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly chargeService = inject(ChargeService);
  private readonly chargeTypeService = inject(ChargeTypeService);
  readonly i18n = inject(I18nService);

  readonly propertyId = signal<number>(0);
  readonly charges = signal<ChargeResponse[]>([]);
  readonly chargeTypes = signal<ChargeTypeResponse[]>([]);
  readonly errorMessage = signal<string>('');

  readonly form = this.fb.group({
    chargeTypeId: [null as number | null, Validators.required],
    tenantUserId: [null as number | null, Validators.required],
    createdByUserId: [null as number | null, Validators.required],
    amount: [null as number | null, Validators.required],
    startDate: [this.toInputDate(new Date()), Validators.required]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id') || '0');
    this.propertyId.set(id);
    this.loadChargeTypes();
    this.loadCharges();
  }

  loadChargeTypes(): void {
    this.chargeTypeService.listAll().subscribe({
      next: (types) => this.chargeTypes.set(types),
      error: () => this.errorMessage.set(this.i18n.translate('building.billing.errors.loadChargeTypes'))
    });
  }

  loadCharges(): void {
    this.errorMessage.set('');
    this.chargeService.getByProperty(this.propertyId()).subscribe({
      next: (page) => this.charges.set(page.content),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.loadCharges'))
    });
  }

  createCharge(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: ChargeRequest = {
      chargeTypeId: Number(value.chargeTypeId),
      propertyId: this.propertyId(),
      tenantUserId: Number(value.tenantUserId),
      createdByUserId: Number(value.createdByUserId),
      amount: Number(value.amount),
      currency: 'USD',
      startDate: new Date(value.startDate as string)
    };

    this.chargeService.create(payload).subscribe({
      next: () => {
        this.form.patchValue({ amount: null, tenantUserId: null });
        this.loadCharges();
      },
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.createCharge'))
    });
  }

  approve(id: number): void {
    const payload: ChargeApprovalRequest = {
      approverUserId: Number(this.form.getRawValue().createdByUserId),
      notes: 'Approved from billing UI'
    };
    this.chargeService.approve(id, payload).subscribe({
      next: () => this.loadCharges(),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.approveCharge'))
    });
  }

  reject(id: number): void {
    const payload: ChargeApprovalRequest = {
      approverUserId: Number(this.form.getRawValue().createdByUserId),
      notes: 'Rejected from billing UI'
    };
    this.chargeService.reject(id, payload).subscribe({
      next: () => this.loadCharges(),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.rejectCharge'))
    });
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}


