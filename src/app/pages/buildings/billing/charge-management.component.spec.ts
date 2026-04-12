import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ChargeManagementComponent } from './charge-management.component';
import { ChargeService, ChargeTypeService } from '../../../services/billing';

describe('ChargeManagementComponent', () => {
  const chargeService = jasmine.createSpyObj<ChargeService>('ChargeService', ['getByProperty', 'create', 'approve', 'reject']);
  const chargeTypeService = jasmine.createSpyObj<ChargeTypeService>('ChargeTypeService', ['listAll']);
  const page = { content: [] as any[], pageable: { pageNumber: 0, pageSize: 10, sort: [] }, totalElements: 0, totalPages: 0, last: true, first: true };

  const activatedRouteStub = {
    snapshot: { paramMap: convertToParamMap({ id: '202' }) },
    parent: null
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    chargeService.getByProperty.and.returnValue(of(page));
    chargeService.create.and.returnValue(of({ id: 1 } as any));
    chargeService.approve.and.returnValue(of({ id: 1 } as any));
    chargeService.reject.and.returnValue(of({ id: 1 } as any));
    chargeTypeService.listAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ChargeManagementComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ChargeService, useValue: chargeService },
        { provide: ChargeTypeService, useValue: chargeTypeService }
      ]
    }).compileComponents();
  });

  it('loads charge types and charges on init', () => {
    const fixture = TestBed.createComponent(ChargeManagementComponent);
    fixture.detectChanges();

    expect(chargeTypeService.listAll).toHaveBeenCalled();
    expect(chargeService.getByProperty).toHaveBeenCalledWith(202);
  });

  it('creates a charge from valid form', () => {
    const fixture = TestBed.createComponent(ChargeManagementComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.patchValue({
      chargeTypeId: 10,
      tenantUserId: 20,
      createdByUserId: 30,
      amount: 350,
      startDate: '2026-04-01'
    });

    component.createCharge();

    expect(chargeService.create).toHaveBeenCalled();
  });

  it('sets error when charge loading fails', () => {
    chargeService.getByProperty.and.returnValue(throwError(() => ({ error: { message: 'cannot load' } })));
    const fixture = TestBed.createComponent(ChargeManagementComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('cannot load');
  });
});

