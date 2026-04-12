import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BillingStatementService, ChargeService, PaymentService } from '../../../services/billing';
import { BillingStatementResponse, ChargeResponse, PaymentResponse } from '../../../models/billing';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ i18n.translate('building.billing.dashboard.title') }}</h1>
          <p class="text-sm text-slate-600">{{ i18n.translate('building.billing.dashboard.subtitle') }} {{ propertyId() }}.</p>
        </div>
        <a [routerLink]="['/property', propertyId()]" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{{ i18n.translate('building.billing.backToProperty') }}</a>
      </div>

      @if (errorMessage()) {
        <p class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
      }

      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-sm text-slate-500">{{ i18n.translate('building.billing.dashboard.charges') }}</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ charges().length }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-sm text-slate-500">{{ i18n.translate('building.billing.dashboard.statements') }}</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ statements().length }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-sm text-slate-500">{{ i18n.translate('building.billing.dashboard.payments') }}</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ payments().length }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <a [routerLink]="['/property', propertyId(), 'billing', 'charges']" class="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 hover:bg-slate-50">{{ i18n.translate('building.billing.dashboard.manageCharges') }}</a>
        <a [routerLink]="['/property', propertyId(), 'billing', 'statements']" class="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 hover:bg-slate-50">{{ i18n.translate('building.billing.dashboard.manageStatements') }}</a>
        <a [routerLink]="['/property', propertyId(), 'billing', 'payments']" class="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 hover:bg-slate-50">{{ i18n.translate('building.billing.dashboard.managePayments') }}</a>
        <a [routerLink]="['/property', propertyId(), 'billing', 'approvals']" class="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 hover:bg-slate-50">{{ i18n.translate('building.billing.dashboard.approvalQueue') }}</a>
        <a [routerLink]="['/property', propertyId(), 'billing', 'reconciliation']" class="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 hover:bg-slate-50">{{ i18n.translate('building.billing.dashboard.reconciliation') }}</a>
      </div>
    </div>
  `
})
export class BillingDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly chargeService = inject(ChargeService);
  private readonly statementService = inject(BillingStatementService);
  private readonly paymentService = inject(PaymentService);
  readonly i18n = inject(I18nService);

  readonly propertyId = signal<number>(0);
  readonly charges = signal<ChargeResponse[]>([]);
  readonly statements = signal<BillingStatementResponse[]>([]);
  readonly payments = signal<PaymentResponse[]>([]);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id') || '0');
    this.propertyId.set(id);
    this.loadData();
  }

  loadData(): void {
    this.errorMessage.set('');
    forkJoin([
      this.chargeService.getByProperty(this.propertyId()),
      this.statementService.getByProperty(this.propertyId()),
      this.paymentService.getByProperty(this.propertyId())
    ]).subscribe({
      next: ([chargesPage, statementsPage, paymentsPage]) => {
        this.charges.set(chargesPage.content);
        this.statements.set(statementsPage.content);
        this.payments.set(paymentsPage.content);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || this.i18n.translate('building.billing.errors.loadDashboard'));
      }
    });
  }
}



