import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingStatementService } from '../../../services/billing';
import { BillingStatementGenerateRequest, BillingStatementResponse } from '../../../models/billing';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-billing-statement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.billing.statement.title') }}</h1>
        <a [routerLink]="['/property', propertyId(), 'billing']" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.backToBilling') }}</a>
      </div>

      @if (errorMessage()) {
        <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      }

      <section class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">{{ i18n.translate('building.billing.statement.generateTitle') }}</h2>
        <form [formGroup]="form" (ngSubmit)="generateStatement()" class="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input type="number" formControlName="tenantUserId" [placeholder]="i18n.translate('building.billing.statement.tenantUserId')" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" formControlName="year" [placeholder]="i18n.translate('building.billing.statement.year')" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" formControlName="month" [placeholder]="i18n.translate('building.billing.statement.month')" class="rounded border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" [disabled]="form.invalid">{{ i18n.translate('building.billing.statement.generate') }}</button>
        </form>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ i18n.translate('building.billing.statement.listTitle') }} ({{ statements().length }})</h2>
          <button type="button" (click)="loadStatements()" class="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.common.refresh') }}</button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left text-slate-500">
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.id') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.statement.period') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.tenant') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.statement.total') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.statement.paid') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.status') }}</th>
                <th class="px-2 py-2">{{ i18n.translate('building.billing.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of statements(); track item.id) {
                <tr class="border-b border-slate-100">
                  <td class="px-2 py-2">{{ item.id }}</td>
                  <td class="px-2 py-2">{{ item.billingPeriod }}</td>
                  <td class="px-2 py-2">{{ item.tenantUserId }}</td>
                  <td class="px-2 py-2">{{ item.totalDue }} {{ item.currency }}</td>
                  <td class="px-2 py-2">{{ item.amountPaid }}</td>
                  <td class="px-2 py-2">{{ item.statementStatus }}</td>
                  <td class="px-2 py-2">
                    <button type="button" (click)="issueStatement(item.id)" class="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">{{ i18n.translate('building.billing.statement.issue') }}</button>
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
export class BillingStatementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly statementService = inject(BillingStatementService);
  readonly i18n = inject(I18nService);

  readonly propertyId = signal<number>(0);
  readonly statements = signal<BillingStatementResponse[]>([]);
  readonly errorMessage = signal<string>('');

  readonly form = this.fb.group({
    tenantUserId: [null as number | null, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id') || '0');
    this.propertyId.set(id);
    this.loadStatements();
  }

  loadStatements(): void {
    this.errorMessage.set('');
    this.statementService.getByProperty(this.propertyId()).subscribe({
      next: (page) => this.statements.set(page.content),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.loadStatements'))
    });
  }

  generateStatement(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: BillingStatementGenerateRequest = {
      propertyId: this.propertyId(),
      tenantUserId: Number(value.tenantUserId),
      billingPeriod: this.formatPeriod(Number(value.year), Number(value.month))
    };

    this.statementService.generate(payload).subscribe({
      next: (statement) => {
        this.statementService.issue({ statementId: statement.id }).subscribe({
          next: () => this.loadStatements(),
          error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.issueAfterGenerate'))
        });
      },
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.generateStatement'))
    });
  }

  issueStatement(statementId: number): void {
    this.statementService.issue({ statementId }).subscribe({
      next: () => this.loadStatements(),
      error: (error) => this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.issueStatement'))
    });
  }

  private formatPeriod(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}


