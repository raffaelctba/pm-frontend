import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingManagementService, PaymentService } from '../../../services/billing';
import { PaymentMethod, PaymentRecordRequest, PaymentResponse } from '../../../models/billing';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-payment-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.billing.payment.title') }}</h1>
        <a [routerLink]="['/property', propertyId(), 'billing']" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.backToBilling') }}</a>
      </div>

      @if (errorMessage()) {
        <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      }

      <section class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">{{ i18n.translate('building.billing.payment.recordTitle') }}</h2>
        <form [formGroup]="form" (ngSubmit)="recordPayment()" class="grid grid-cols-1 gap-3 md:grid-cols-6">
          <input type="number" formControlName="tenantUserId" [placeholder]="i18n.translate('building.billing.payment.tenantUserId')" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" formControlName="processedByUserId" [placeholder]="'Processed by user ID'" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" formControlName="amount" [placeholder]="i18n.translate('building.billing.payment.amount')" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <select formControlName="paymentMethod" class="rounded border border-slate-300 px-3 py-2 text-sm">
            @for (method of methods; track method) {
              <option [value]="method">{{ method }}</option>
            }
          </select>
          <input type="text" formControlName="referenceNumber" [placeholder]="'Reference number'" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="text" formControlName="externalTransactionId" [placeholder]="'External transaction ID'" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" formControlName="receivedDate" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" [disabled]="form.invalid">{{ i18n.translate('building.billing.payment.recordAndAllocate') }}</button>
        </form>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ i18n.translate('building.billing.payment.listTitle') }} ({{ payments().length }})</h2>
          <button type="button" (click)="loadPayments()" class="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.common.refresh') }}</button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left text-slate-500">
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.id') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.tenant') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.amount') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.payment.method') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.status') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.payment.received') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of payments(); track item.id) {
                <tr class="border-b border-slate-100">
                  <td class="px-2 py-2">{{ item.id }}</td>
                  <td class="px-2 py-2">{{ item.tenantUserId }}</td>
                  <td class="px-2 py-2">{{ item.amount }} {{ item.currency }}</td>
                  <td class="px-2 py-2">{{ item.paymentMethod }}</td>
                  <td class="px-2 py-2">{{ item.paymentStatus }}</td>
                  <td class="px-2 py-2">{{ item.receivedDate | date:'shortDate' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
})
export class PaymentEntryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly billingManagementService = inject(BillingManagementService);
  readonly i18n = inject(I18nService);

  readonly propertyId = signal<number>(0);
  readonly payments = signal<PaymentResponse[]>([]);
  readonly errorMessage = signal<string>('');

  readonly methods = Object.values(PaymentMethod);

  readonly form = this.fb.group({
    tenantUserId: [null as number | null, Validators.required],
    processedByUserId: [null as number | null, Validators.required],
    amount: [null as number | null, Validators.required],
    paymentMethod: [PaymentMethod.BANK_TRANSFER, Validators.required],
    referenceNumber: [''],
    externalTransactionId: [''],
    receivedDate: [this.toInputDate(new Date()), Validators.required]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id') || '0');
    this.propertyId.set(id);
    this.loadPayments();
  }

  loadPayments(): void {
    this.errorMessage.set('');
    this.paymentService.getByProperty(this.propertyId()).subscribe({
      next: (page) => this.payments.set(page.content),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.loadPayments'))
    });
  }

  recordPayment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: PaymentRecordRequest = {
      propertyId: this.propertyId(),
      tenantUserId: Number(value.tenantUserId),
      processedByUserId: Number(value.processedByUserId),
      amount: Number(value.amount),
      currency: 'USD',
      paymentMethod: value.paymentMethod as PaymentMethod,
      referenceNumber: String(value.referenceNumber || ''),
      externalTransactionId: String(value.externalTransactionId || ''),
      receivedDate: new Date(String(value.receivedDate))
    };

    this.billingManagementService.recordAndAllocatePayment(payload, true).subscribe({
      next: () => {
        this.form.patchValue({ amount: null, tenantUserId: null, processedByUserId: null, referenceNumber: '', externalTransactionId: '' });
        this.loadPayments();
      },
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.recordPayment'))
    });
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}


