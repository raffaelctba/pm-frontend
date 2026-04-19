import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { UnitDashboardComponent } from './building-unit-dashboard.component';
import { BuildingUnitService } from '../../../services/building/building-unit.service';
import { I18nService } from '../../../services/i18n.service';

describe('UnitDashboardComponent', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({ id: '19', unitId: '21' }));
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({}));

  const routeStub = {
    paramMap: paramMap$.asObservable(),
    queryParamMap: queryParamMap$.asObservable(),
    parent: {
      snapshot: {
        paramMap: convertToParamMap({ id: '19' })
      }
    },
    snapshot: {
      paramMap: convertToParamMap({ id: '19', unitId: '21' })
    }
  } as unknown as ActivatedRoute;

  const unitService = jasmine.createSpyObj<BuildingUnitService>('BuildingUnitService', ['getUnitDetails']);
  const i18nService = {
    translate: (key: string) => key
  } as I18nService;

  const unitDetailsResponse = {
    buildingId: 19,
    unitId: 21,
    unitNumber: 'A101',
    unitType: 'RESIDENTIAL',
    status: 'OCCUPIED',
    occupied: true,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    outstandingAmount: 0,
    paidAmount: 0,
    paymentHistory: [],
    recentActivity: []
  } as any;

  beforeEach(async () => {
    queryParamMap$.next(convertToParamMap({}));
    unitService.getUnitDetails.calls.reset();
    unitService.getUnitDetails.and.returnValue(of(unitDetailsResponse));

    await TestBed.configureTestingModule({
      imports: [UnitDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: BuildingUnitService, useValue: unitService },
        { provide: I18nService, useValue: i18nService }
      ]
    }).compileComponents();
  });

  it('loads details with elevatedVisibility false by default', () => {
    const fixture = TestBed.createComponent(UnitDashboardComponent);
    fixture.detectChanges();

    expect(unitService.getUnitDetails).toHaveBeenCalledWith(19, 21, { elevatedVisibility: false });
  });

  it('loads details with elevatedVisibility true when query param is set', () => {
    queryParamMap$.next(convertToParamMap({ elevatedVisibility: 'true' }));

    const fixture = TestBed.createComponent(UnitDashboardComponent);
    fixture.detectChanges();

    expect(unitService.getUnitDetails).toHaveBeenCalledWith(19, 21, { elevatedVisibility: true });
  });

  it('updates query param when elevated visibility toggle changes', () => {
    const fixture = TestBed.createComponent(UnitDashboardComponent);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.componentInstance.setElevatedVisibility(true);

    expect(navigateSpy).toHaveBeenCalled();
  });
});


