import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReconciliationComponent } from './reconciliation.component';
import { BillingStatementService } from '../../../services/billing';

describe('ReconciliationComponent', () => {
  const statementService = jasmine.createSpyObj<BillingStatementService>('BillingStatementService', ['reconcile']);

  const activatedRouteStub = {
    snapshot: { paramMap: convertToParamMap({ id: '606' }) },
    parent: null
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    statementService.reconcile.and.returnValue(of({
      period: '2026-04',
      propertyId: 606,
      totalCharges: 100,
      totalPayments: 100,
      differences: 0,
      discrepancies: [],
      reconciled: true
    } as any));

    await TestBed.configureTestingModule({
      imports: [ReconciliationComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BillingStatementService, useValue: statementService }
      ]
    }).compileComponents();
  });

  it('runs reconciliation from form', () => {
    const fixture = TestBed.createComponent(ReconciliationComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.patchValue({ period: '2026-04' });
    component.runReconciliation();

    expect(statementService.reconcile).toHaveBeenCalledWith({ propertyId: 606, period: '2026-04' });
    expect(component.result()).not.toBeNull();
  });

  it('sets error when reconciliation fails', () => {
    statementService.reconcile.and.returnValue(throwError(() => ({ error: { message: 'recon fail' } })));
    const fixture = TestBed.createComponent(ReconciliationComponent);
    fixture.detectChanges();

    fixture.componentInstance.runReconciliation();
    expect(fixture.componentInstance.errorMessage()).toBe('recon fail');
  });
});

