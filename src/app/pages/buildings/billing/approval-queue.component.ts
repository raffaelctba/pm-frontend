import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingManagementService, ChargeService } from '../../../services/billing';
import { ChargeResponse } from '../../../models/billing';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-approval-queue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.billing.approval.title') }}</h1>
        <a [routerLink]="['/property', propertyId(), 'billing']" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.backToBilling') }}</a>
      </div>

      @if (errorMessage()) {
        <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      }

      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ i18n.translate('building.billing.approval.pendingCharges') }} ({{ pendingCharges().length }})</h2>
          <div class="flex gap-2">
            <button type="button" (click)="loadPending()" class="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.common.refresh') }}</button>
          </div>
        </div>

        <form [formGroup]="form" class="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
          <input type="number" formControlName="approverUserId" placeholder="Approver user ID" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <button type="button" (click)="approveSelected()" class="rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700" [disabled]="selectedIds().size === 0 || form.invalid">{{ i18n.translate('building.billing.approval.approveSelected') }}</button>
          <button type="button" (click)="rejectSelected()" class="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700" [disabled]="selectedIds().size === 0 || form.invalid">{{ i18n.translate('building.billing.approval.rejectSelected') }}</button>
        </form>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left text-slate-500">
                <th class="px-2 py-2">{{ i18n.translate('building.billing.approval.select') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.id') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.charge.type') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.tenant') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.amount') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.charge.approval') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of pendingCharges(); track item.id) {
                <tr class="border-b border-slate-100">
                  <td class="px-2 py-2">
                    <input type="checkbox" [checked]="selectedIds().has(item.id)" (change)="toggleSelection(item.id, $any($event.target).checked)" />
                  </td>
                  <td class="px-2 py-2">{{ item.id }}</td>
                  <td class="px-2 py-2">{{ item.chargeTypeName }}</td>
                  <td class="px-2 py-2">{{ item.tenantUserId }}</td>
                  <td class="px-2 py-2">{{ item.amount }} {{ item.currency }}</td>
                  <td class="px-2 py-2">{{ item.approvalStatus }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
})
export class ApprovalQueueComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly chargeService = inject(ChargeService);
  private readonly billingManagementService = inject(BillingManagementService);
  readonly i18n = inject(I18nService);

  readonly propertyId = signal<number>(0);
  readonly pendingCharges = signal<ChargeResponse[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set<number>());
  readonly errorMessage = signal<string>('');

  readonly form = this.fb.nonNullable.group({
    approverUserId: [0, Validators.required]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id') || '0');
    this.propertyId.set(id);
    this.loadPending();
  }

  loadPending(): void {
    this.errorMessage.set('');
    this.selectedIds.set(new Set<number>());
    this.chargeService.getPendingApprovals(this.propertyId()).subscribe({
      next: (page) => this.pendingCharges.set(page.content),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.loadApprovals'))
    });
  }

  toggleSelection(id: number, checked: boolean): void {
    const next = new Set(this.selectedIds());
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.selectedIds.set(next);
  }

  approveSelected(): void {
    const ids = Array.from(this.selectedIds());
    const approverUserId = Number(this.form.getRawValue().approverUserId);
    this.billingManagementService.processPendingApprovals(ids, true, approverUserId, 'Approved in batch').subscribe({
      next: () => this.loadPending(),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.approveSelected'))
    });
  }

  rejectSelected(): void {
    const ids = Array.from(this.selectedIds());
    const approverUserId = Number(this.form.getRawValue().approverUserId);
    this.billingManagementService.processPendingApprovals(ids, false, approverUserId, 'Rejected in batch').subscribe({
      next: () => this.loadPending(),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.rejectSelected'))
    });
  }
}


