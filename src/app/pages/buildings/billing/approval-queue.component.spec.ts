import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApprovalQueueComponent } from './approval-queue.component';
import { BillingManagementService, ChargeService } from '../../../services/billing';

describe('ApprovalQueueComponent', () => {
  const chargeService = jasmine.createSpyObj<ChargeService>('ChargeService', ['getPendingApprovals']);
  const billingManagementService = jasmine.createSpyObj<BillingManagementService>('BillingManagementService', ['processPendingApprovals']);
  const page = { content: [{ id: 7 } as any], pageable: { pageNumber: 0, pageSize: 10, sort: [] }, totalElements: 1, totalPages: 1, last: true, first: true };

  const activatedRouteStub = {
    snapshot: { paramMap: convertToParamMap({ id: '505' }) },
    parent: null
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    chargeService.getPendingApprovals.and.returnValue(of(page));
    billingManagementService.processPendingApprovals.and.returnValue(of([] as any));

    await TestBed.configureTestingModule({
      imports: [ApprovalQueueComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ChargeService, useValue: chargeService },
        { provide: BillingManagementService, useValue: billingManagementService }
      ]
    }).compileComponents();
  });

  it('loads pending approvals on init', () => {
    const fixture = TestBed.createComponent(ApprovalQueueComponent);
    fixture.detectChanges();

    expect(chargeService.getPendingApprovals).toHaveBeenCalledWith(505);
  });

  it('approves selected charges', () => {
    const fixture = TestBed.createComponent(ApprovalQueueComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.patchValue({ approverUserId: 900 });
    component.selectedIds.set(new Set([7, 8]));
    component.approveSelected();

    expect(billingManagementService.processPendingApprovals).toHaveBeenCalledWith([7, 8], true, 900, 'Approved in batch');
  });

  it('sets error when approvals loading fails', () => {
    chargeService.getPendingApprovals.and.returnValue(throwError(() => ({ error: { message: 'queue fail' } })));
    const fixture = TestBed.createComponent(ApprovalQueueComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('queue fail');
  });
});

