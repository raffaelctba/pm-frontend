import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingStatementService } from '../../../services/billing';
import { ReconciliationResult } from '../../../models/billing';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.billing.reconciliation.title') }}</h1>
        <a [routerLink]="['/property', propertyId(), 'billing']" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.backToBilling') }}</a>
      </div>

      @if (errorMessage()) {
        <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      }

      <section class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">{{ i18n.translate('building.billing.reconciliation.runTitle') }}</h2>
        <form [formGroup]="form" (ngSubmit)="runReconciliation()" class="flex flex-col gap-3 md:flex-row md:items-center">
          <input type="month" formControlName="period" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" [disabled]="form.invalid">{{ i18n.translate('building.billing.reconciliation.run') }}</button>
        </form>
      </section>

      @if (result()) {
        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 class="mb-3 text-lg font-semibold">{{ i18n.translate('building.billing.reconciliation.resultTitle') }}</h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div class="rounded border border-slate-200 p-3">
              <p class="text-xs text-slate-500">{{ i18n.translate('building.billing.statement.period') }}</p>
              <p class="text-lg font-semibold text-slate-900">{{ result()!.period }}</p>
            </div>
            <div class="rounded border border-slate-200 p-3">
              <p class="text-xs text-slate-500">{{ i18n.translate('building.billing.reconciliation.totalCharges') }}</p>
              <p class="text-lg font-semibold text-slate-900">{{ result()!.totalCharges }}</p>
            </div>
            <div class="rounded border border-slate-200 p-3">
              <p class="text-xs text-slate-500">{{ i18n.translate('building.billing.reconciliation.totalPayments') }}</p>
              <p class="text-lg font-semibold text-slate-900">{{ result()!.totalPayments }}</p>
            </div>
          </div>

          <p class="mt-4 text-sm" [class.text-emerald-700]="result()!.reconciled" [class.text-red-700]="!result()!.reconciled">
            {{ i18n.translate('building.billing.reconciliation.reconciled') }}: {{ result()!.reconciled ? i18n.translate('building.billing.common.yes') : i18n.translate('building.billing.common.no') }}
          </p>

          @if (result()!.discrepancies.length > 0) {
            <div class="mt-4">
              <h3 class="mb-2 font-semibold text-slate-900">{{ i18n.translate('building.billing.reconciliation.discrepancies') }}</h3>
              <ul class="space-y-2 text-sm">
                @for (item of result()!.discrepancies; track item.reference + item.type) {
                  <li class="rounded border border-amber-200 bg-amber-50 px-3 py-2">
                    <strong>{{ item.type }}</strong> - {{ item.description }} ({{ item.amount }})
                  </li>
                }
              </ul>
            </div>
          }
        </section>
      }
    </div>
  `
})
export class ReconciliationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly statementService = inject(BillingStatementService);
  readonly i18n = inject(I18nService);

  readonly propertyId = signal<number>(0);
  readonly result = signal<ReconciliationResult | null>(null);
  readonly errorMessage = signal<string>('');

  readonly form = this.fb.group({
    period: [this.currentPeriod(), Validators.required]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id') || '0');
    this.propertyId.set(id);
  }

  runReconciliation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    const period = String(this.form.getRawValue().period);

    this.statementService.reconcile({ propertyId: this.propertyId(), period }).subscribe({
      next: (value) => this.result.set(value),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.runReconciliation'))
    });
  }

  private currentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}


