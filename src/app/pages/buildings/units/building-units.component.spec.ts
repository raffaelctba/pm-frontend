import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BuildingUnitsComponent } from './building-units.component';
import { BuildingUnitService } from '../../../services/building/building-unit.service';
import { PropertyService } from '../../../services/property.service';
import { BuildingRealtimeService } from '../../../services/building/building-realtime.service';
import { I18nService } from '../../../services/i18n.service';

describe('BuildingUnitsComponent', () => {
  const routeStub = {
    snapshot: {
      paramMap: convertToParamMap({ id: '19' })
    },
    parent: null
  } as unknown as ActivatedRoute;

  const unitService = jasmine.createSpyObj<BuildingUnitService>('BuildingUnitService', [
    'getUnits',
    'getAssignableUsers',
    'getUnitDetails',
    'createUnit',
    'updateUnit',
    'deleteUnit'
  ]);

  const propertyService = jasmine.createSpyObj<PropertyService>('PropertyService', ['getPropertyById']);
  const realtimeService = jasmine.createSpyObj<BuildingRealtimeService>('BuildingRealtimeService', ['connectToBuildingAlerts', 'disconnect', 'events$']);

  const pageResponse = {
    content: [],
    pageable: { pageNumber: 0, pageSize: 10, sort: [] },
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  } as any;

  const detailsResponse = {
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
    unitService.getUnits.and.returnValue(of(pageResponse));
    unitService.getAssignableUsers.and.returnValue(of({ owners: [], tenants: [] }));
    unitService.getUnitDetails.and.returnValue(of(detailsResponse));
    propertyService.getPropertyById.and.returnValue(of({ id: 19, currentUserRole: 'PROPERTY_OWNER' } as any));
    realtimeService.events$.and.returnValue(of());

    await TestBed.configureTestingModule({
      imports: [BuildingUnitsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: BuildingUnitService, useValue: unitService },
        { provide: PropertyService, useValue: propertyService },
        { provide: BuildingRealtimeService, useValue: realtimeService },
        { provide: I18nService, useValue: { translate: (key: string) => key } }
      ]
    }).compileComponents();
  });

  it('loads quick preview with elevatedVisibility false by default', () => {
    const fixture = TestBed.createComponent(BuildingUnitsComponent);
    fixture.detectChanges();

    fixture.componentInstance.openUnitDetails({ id: 21 } as any);

    expect(unitService.getUnitDetails).toHaveBeenCalledWith(19, 21, { elevatedVisibility: false });
  });

  it('reloads selected quick preview with elevatedVisibility true when toggled', () => {
    const fixture = TestBed.createComponent(BuildingUnitsComponent);
    fixture.detectChanges();

    fixture.componentInstance.openUnitDetails({ id: 21 } as any);
    fixture.componentInstance.setPreviewElevatedVisibility(true);

    expect(unitService.getUnitDetails).toHaveBeenCalledWith(19, 21, { elevatedVisibility: true });
    expect(fixture.componentInstance.dashboardVisibilityQueryParams(21)).toEqual({ elevatedVisibility: 'true' });
  });
});

