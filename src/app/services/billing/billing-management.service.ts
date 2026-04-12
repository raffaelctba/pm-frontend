/**
 * High-level billing management service
 * Orchestrates complex billing workflows combining multiple services
 */

import { Injectable, signal } from '@angular/core';
import { Observable, forkJoin, combineLatest, of } from 'rxjs';
import { tap, catchError, finalize, switchMap, map } from 'rxjs/operators';
import {
  ChargeTypeService,
  ChargeService,
  BillingStatementService,
  PaymentService
} from './index';
import {
  ChargeResponse,
  ChargeApprovalRequest,
  ChargeRequest,
  BillingStatementGenerateRequest,
  BillingStatementResponse,
  PaymentRecordRequest,
  PaymentAllocationRequest,
  PaymentResponse,
  TenantPaymentSummary
} from '../../models/billing';

@Injectable({
  providedIn: 'root'
})
export class BillingManagementService {
  // Signal-based state management
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private _chargeTypeService: ChargeTypeService,
    private chargeService: ChargeService,
    private statementService: BillingStatementService,
    private paymentService: PaymentService
  ) {}

  /**
   * Get current loading state
   */
  getLoadingState(): boolean {
    return this.isLoading();
  }

  /**
   * Get current error state
   */
  getErrorState(): string | null {
    return this.error();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Complete workflow: Generate statement and issue it
   */
  generateAndIssueStatement(
    propertyId: number,
    tenantUserId: number,
    year: number,
    month: number
  ): Observable<BillingStatementResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    const generateRequest: BillingStatementGenerateRequest = {
      propertyId,
      tenantUserId,
      billingPeriod: this.formatPeriod(year, month)
    };

    return this.statementService.generate(generateRequest).pipe(
      switchMap(statement => {
        const issueRequest = { statementId: statement.id };
        return this.statementService.issue(issueRequest);
      }),
      tap(() => this.error.set(null)),
      catchError(err => {
        const message = err?.error?.message || 'Failed to generate and issue statement';
        this.error.set(message);
        throw err;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Complete workflow: Record payment and auto-allocate
   */
  recordAndAllocatePayment(
    paymentRequest: PaymentRecordRequest,
    autoAllocate: boolean = true
  ): Observable<PaymentResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.paymentService.recordPayment(paymentRequest).pipe(
      switchMap(payment => {
        if (!autoAllocate) {
          return of(payment);
        }

        const allocationRequest: PaymentAllocationRequest = {
          paymentId: payment.id,
          tenantUserId: paymentRequest.tenantUserId
        };

        return this.paymentService.allocatePayment(allocationRequest);
      }),
      tap(() => this.error.set(null)),
      catchError(err => {
        const message = err?.error?.message || 'Failed to record and allocate payment';
        this.error.set(message);
        throw err;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Get complete billing picture for a tenant in a property
   */
  getTenantBillingPicture(
    tenantUserId: number,
    propertyId: number
  ): Observable<{
    tenantSummary: TenantPaymentSummary;
    pendingCharges: ChargeResponse[];
    recentStatements: BillingStatementResponse[];
  }> {
    this.isLoading.set(true);
    this.error.set(null);

    return combineLatest([
      this.paymentService.getByProperty(propertyId),
      this.chargeService.getByProperty(propertyId),
      this.statementService.getByProperty(propertyId)
    ]).pipe(
      map(([paymentsPage, chargesPage, statementsPage]) => {
        const tenantPayments = paymentsPage.content.filter(payment => payment.tenantUserId === tenantUserId);
        const totalPaid = tenantPayments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
        const allocatedAmount = tenantPayments.reduce((sum, payment) => sum + (payment.allocatedAmount ?? 0), 0);
        const pendingAmount = tenantPayments.reduce((sum, payment) => sum + (payment.unallocatedAmount ?? 0), 0);
        const lastPaymentDate = tenantPayments
          .map(payment => payment.receivedDate)
          .filter((date): date is Date => !!date)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .pop();
        const latestPaymentMethod = tenantPayments.length > 0 ? tenantPayments[0].paymentMethod : undefined;

        const tenantSummary: TenantPaymentSummary = {
          tenantUserId,
          propertyId,
          totalPaid,
          pendingAmount,
          allocatedAmount,
          remainingBalance: pendingAmount,
          currency: tenantPayments[0]?.currency || 'USD',
          ...(lastPaymentDate ? { lastPaymentDate } : {}),
          ...(latestPaymentMethod ? { paymentMethod: latestPaymentMethod } : {})
        };

        return {
          tenantSummary,
          pendingCharges: chargesPage.content,
          recentStatements: statementsPage.content
        };
      }),
      tap(() => this.error.set(null)),
      catchError(err => {
        const message = err?.error?.message || 'Failed to fetch billing picture';
        this.error.set(message);
        throw err;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Create charges from a template for multiple tenants
   */
  createChargesFromTemplate(
    chargeTypeId: number,
    propertyId: number,
    tenantUserIds: number[],
    createdByUserId: number,
    amount: number,
    startDate?: Date
  ): Observable<ChargeResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    const requests = tenantUserIds.map(tenantUserId => {
      const chargeRequest: ChargeRequest = {
        chargeTypeId,
        propertyId,
        tenantUserId,
        createdByUserId,
        amount,
        currency: 'USD',
        startDate: startDate || new Date()
      };
      return this.chargeService.create(chargeRequest);
    });

    return forkJoin(requests).pipe(
      tap(() => this.error.set(null)),
      catchError(err => {
        const message = err?.error?.message || 'Failed to create charges from template';
        this.error.set(message);
        throw err;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Bulk approve/reject pending charges
   */
  processPendingApprovals(
    chargeIds: number[],
    approve: boolean,
    approverUserId: number,
    notes: string = ''
  ): Observable<ChargeResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    const requests = chargeIds.map(chargeId => {
      const approvalRequest: ChargeApprovalRequest = {
        approverUserId,
        notes
      };
      return approve
        ? this.chargeService.approve(chargeId, approvalRequest)
        : this.chargeService.reject(chargeId, approvalRequest);
    });

    return forkJoin(requests).pipe(
      tap(() => this.error.set(null)),
      catchError(err => {
        const message = err?.error?.message || 'Failed to process approvals';
        this.error.set(message);
        throw err;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Helper: Check if tenant can make payments
   */
  canTenantPayNow(tenantSummary: TenantPaymentSummary): boolean {
    return tenantSummary.pendingAmount > 0;
  }

  /**
   * Helper: Check if statement is overdue
   */
  isStatementOverdue(statement: BillingStatementResponse): boolean {
    if (!statement.dueDate) return false;
    return new Date(statement.dueDate) < new Date();
  }

  /**
   * Helper: Get formatted period from year/month
   */
  formatPeriod(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  /**
   * Helper: Get tenant name display
   */
  getTenantDisplayName(summary: TenantPaymentSummary): string {
    return `Tenant ${summary.tenantUserId}`;
  }
}


