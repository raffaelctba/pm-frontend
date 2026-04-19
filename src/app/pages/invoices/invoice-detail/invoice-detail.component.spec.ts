import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InvoiceDetailComponent } from './invoice-detail.component';
import { InvoiceService } from '../../../services/invoice.service';

describe('InvoiceDetailComponent', () => {
  const invoiceService = jasmine.createSpyObj<InvoiceService>('InvoiceService', [
    'getInvoiceById',
    'getAuditTrail',
    'getLineItems',
    'getDeliveryHistory',
    'getPaymentReversals',
    'addLineItem',
    'updateLineItem',
    'deleteLineItem',
    'sendInvoice',
    'reversePayment',
    'voidInvoice',
    'deleteDraftInvoice',
    'createCreditNote',
    'createDebitNote',
    'voidAndReissue',
    'markAsPaid',
    'finalizeDraftInvoice'
  ]);

  const invoice = {
    id: 1,
    propertyId: 10,
    userId: 20,
    invoiceNumber: 'INV-001',
    amount: 1000,
    dueDate: '2026-04-30',
    status: 'DRAFT',
    lateFee: 0,
    interest: 0,
    totalAmount: 1000,
    deliveryStatus: 'NOT_SENT'
  } as any;

  beforeEach(async () => {
    invoiceService.getInvoiceById.and.returnValue(of(invoice));
    invoiceService.getAuditTrail.and.returnValue(of([]));
    invoiceService.getLineItems.and.returnValue(of([]));
    invoiceService.getDeliveryHistory.and.returnValue(of([]));
    invoiceService.getPaymentReversals.and.returnValue(of([]));
    invoiceService.addLineItem.and.returnValue(of({ id: 5 } as any));
    invoiceService.updateLineItem.and.returnValue(of({ id: 5 } as any));
    invoiceService.deleteLineItem.and.returnValue(of(void 0));
    invoiceService.sendInvoice.and.returnValue(of({ id: 9, deliveryMethod: 'EMAIL' } as any));
    invoiceService.reversePayment.and.returnValue(of({ id: 13 } as any));
    invoiceService.voidInvoice.and.returnValue(of({ ...invoice, status: 'VOIDED' } as any));
    invoiceService.deleteDraftInvoice.and.returnValue(of(void 0));
    invoiceService.createCreditNote.and.returnValue(of({} as any));
    invoiceService.createDebitNote.and.returnValue(of({} as any));
    invoiceService.voidAndReissue.and.returnValue(of({ voidedInvoice: invoice, reissuedInvoice: invoice } as any));
    invoiceService.markAsPaid.and.returnValue(of({ ...invoice, status: 'PAID' } as any));
    invoiceService.finalizeDraftInvoice.and.returnValue(of({ ...invoice, status: 'PENDING' } as any));

    await TestBed.configureTestingModule({
      imports: [InvoiceDetailComponent],
      providers: [
        provideRouter([]),
        { provide: InvoiceService, useValue: invoiceService },
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } }
      ]
    }).compileComponents();
  });

  it('loads invoice and lifecycle sections on init', () => {
    const fixture = TestBed.createComponent(InvoiceDetailComponent);
    fixture.detectChanges();

    expect(invoiceService.getInvoiceById).toHaveBeenCalledWith(1);
    expect(invoiceService.getAuditTrail).toHaveBeenCalledWith(1);
    expect(invoiceService.getLineItems).toHaveBeenCalledWith(1);
    expect(invoiceService.getDeliveryHistory).toHaveBeenCalledWith(1);
    expect(invoiceService.getPaymentReversals).toHaveBeenCalledWith(1);
  });

  it('submits a new line item through service', () => {
    spyOn(window, 'alert');
    const fixture = TestBed.createComponent(InvoiceDetailComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.lineItemForm.description = 'Parking';
    component.lineItemForm.unitPrice = 150;
    component.submitLineItem();

    expect(invoiceService.addLineItem).toHaveBeenCalled();
  });

  it('sends invoice through service', () => {
    spyOn(window, 'alert');
    const fixture = TestBed.createComponent(InvoiceDetailComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.sendInvoiceForm.deliveryMethod = 'EMAIL';
    component.sendInvoiceForm.recipientEmail = 'tenant@example.com';
    component.submitSendInvoice();

    expect(invoiceService.sendInvoice).toHaveBeenCalledWith(1, jasmine.objectContaining({
      deliveryMethod: 'EMAIL',
      recipientEmail: 'tenant@example.com'
    }));
  });

  it('reverses payment when form is valid', () => {
    spyOn(window, 'alert');
    const fixture = TestBed.createComponent(InvoiceDetailComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.invoice = { ...invoice, status: 'PAID' };
    component.paymentReversalForm.paymentId = 99;
    component.paymentReversalForm.reversalAmount = 100;
    component.paymentReversalForm.reason = 'Adjustment';

    component.submitPaymentReversal();

    expect(invoiceService.reversePayment).toHaveBeenCalledWith(1, jasmine.objectContaining({
      paymentId: 99,
      reversalAmount: 100,
      reason: 'Adjustment'
    }));
  });
});

