import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BillingDashboardComponent } from './billing-dashboard.component';
import { ChargeService, BillingStatementService, PaymentService } from '../../../services/billing';

describe('BillingDashboardComponent', () => {
  const chargeService = jasmine.createSpyObj<ChargeService>('ChargeService', ['getByProperty']);
  const statementService = jasmine.createSpyObj<BillingStatementService>('BillingStatementService', ['getByProperty']);
  const paymentService = jasmine.createSpyObj<PaymentService>('PaymentService', ['getByProperty']);
  const page = { content: [] as any[], pageable: { pageNumber: 0, pageSize: 10, sort: [] }, totalElements: 0, totalPages: 0, last: true, first: true };

  const activatedRouteStub = {
    snapshot: { paramMap: convertToParamMap({ id: '101' }) },
    parent: null
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    chargeService.getByProperty.and.returnValue(of(page));
    statementService.getByProperty.and.returnValue(of(page));
    paymentService.getByProperty.and.returnValue(of(page));

    await TestBed.configureTestingModule({
      imports: [BillingDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ChargeService, useValue: chargeService },
        { provide: BillingStatementService, useValue: statementService },
        { provide: PaymentService, useValue: paymentService }
      ]
    }).compileComponents();
  });

  it('loads billing data on init', () => {
    const fixture = TestBed.createComponent(BillingDashboardComponent);
    fixture.detectChanges();

    expect(chargeService.getByProperty).toHaveBeenCalledWith(101);
    expect(statementService.getByProperty).toHaveBeenCalledWith(101);
    expect(paymentService.getByProperty).toHaveBeenCalledWith(101);
  });

  it('sets error message when loading fails', () => {
    chargeService.getByProperty.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));
    const fixture = TestBed.createComponent(BillingDashboardComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('boom');
  });
});

