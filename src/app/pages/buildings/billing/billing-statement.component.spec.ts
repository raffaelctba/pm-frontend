import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BillingStatementComponent } from './billing-statement.component';
import { BillingStatementService } from '../../../services/billing';

describe('BillingStatementComponent', () => {
  const statementService = jasmine.createSpyObj<BillingStatementService>('BillingStatementService', ['getByProperty', 'generate', 'issue']);
  const page = { content: [] as any[], pageable: { pageNumber: 0, pageSize: 10, sort: [] }, totalElements: 0, totalPages: 0, last: true, first: true };

  const activatedRouteStub = {
    snapshot: { paramMap: convertToParamMap({ id: '303' }) },
    parent: null
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    statementService.getByProperty.and.returnValue(of(page));
    statementService.generate.and.returnValue(of({ id: 500 } as any));
    statementService.issue.and.returnValue(of({ id: 500 } as any));

    await TestBed.configureTestingModule({
      imports: [BillingStatementComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BillingStatementService, useValue: statementService }
      ]
    }).compileComponents();
  });

  it('loads statements on init', () => {
    const fixture = TestBed.createComponent(BillingStatementComponent);
    fixture.detectChanges();

    expect(statementService.getByProperty).toHaveBeenCalledWith(303);
  });

  it('generates and issues statement from form', () => {
    const fixture = TestBed.createComponent(BillingStatementComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.patchValue({
      tenantUserId: 44,
      year: 2026,
      month: 4
    });

    component.generateStatement();

    expect(statementService.generate).toHaveBeenCalled();
    expect(statementService.issue).toHaveBeenCalled();
  });

  it('sets error when statement load fails', () => {
    statementService.getByProperty.and.returnValue(throwError(() => ({ error: { message: 'load failed' } })));
    const fixture = TestBed.createComponent(BillingStatementComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('load failed');
  });
});

