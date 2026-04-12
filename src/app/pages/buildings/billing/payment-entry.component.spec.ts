import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PaymentEntryComponent } from './payment-entry.component';
import { BillingManagementService, PaymentService } from '../../../services/billing';
import { PaymentMethod } from '../../../models/billing';

describe('PaymentEntryComponent', () => {
  const paymentService = jasmine.createSpyObj<PaymentService>('PaymentService', ['getByProperty']);
  const billingManagementService = jasmine.createSpyObj<BillingManagementService>('BillingManagementService', ['recordAndAllocatePayment']);
  const page = { content: [] as any[], pageable: { pageNumber: 0, pageSize: 10, sort: [] }, totalElements: 0, totalPages: 0, last: true, first: true };

  const activatedRouteStub = {
    snapshot: { paramMap: convertToParamMap({ id: '404' }) },
    parent: null
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    paymentService.getByProperty.and.returnValue(of(page));
    billingManagementService.recordAndAllocatePayment.and.returnValue(of({ id: 1 } as any));

    await TestBed.configureTestingModule({
      imports: [PaymentEntryComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PaymentService, useValue: paymentService },
        { provide: BillingManagementService, useValue: billingManagementService }
      ]
    }).compileComponents();
  });

  it('loads payments on init', () => {
    const fixture = TestBed.createComponent(PaymentEntryComponent);
    fixture.detectChanges();

    expect(paymentService.getByProperty).toHaveBeenCalledWith(404);
  });

  it('records payment from valid form', () => {
    const fixture = TestBed.createComponent(PaymentEntryComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.patchValue({
      tenantUserId: 55,
      processedByUserId: 66,
      amount: 900,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceNumber: 'REF-1',
      externalTransactionId: 'EXT-1',
      receivedDate: '2026-04-10'
    });

    component.recordPayment();

    expect(billingManagementService.recordAndAllocatePayment).toHaveBeenCalled();
  });

  it('sets error when payment load fails', () => {
    paymentService.getByProperty.and.returnValue(throwError(() => ({ error: { message: 'payments fail' } })));
    const fixture = TestBed.createComponent(PaymentEntryComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('payments fail');
  });
});


