import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BuildingUnitService } from './building-unit.service';

describe('BuildingUnitService', () => {
  let service: BuildingUnitService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BuildingUnitService
      ]
    });

    service = TestBed.inject(BuildingUnitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds elevatedVisibility query param for getUnitDetails when requested', () => {
    service.getUnitDetails(19, 21, { elevatedVisibility: true }).subscribe();

    const req = httpMock.expectOne((request) =>
      request.url.includes('/api/buildings/19/units/21/details')
      && request.params.get('elevatedVisibility') === 'true'
    );

    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('does not send elevatedVisibility query param by default', () => {
    service.getUnitDetails(19, 21).subscribe();

    const req = httpMock.expectOne((request) =>
      request.url.includes('/api/buildings/19/units/21/details')
      && !request.params.has('elevatedVisibility')
    );

    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('adds elevatedVisibility query param for getUnit when requested', () => {
    service.getUnit(19, 21, { elevatedVisibility: true }).subscribe();

    const req = httpMock.expectOne((request) =>
      request.url.includes('/api/buildings/19/units/21')
      && request.params.get('elevatedVisibility') === 'true'
    );

    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('posts to resend a pending unit invitation', () => {
    service.resendUnitInvitation(19, 21, 'TENANT').subscribe();

    const req = httpMock.expectOne((request) =>
      request.url.includes('/api/buildings/19/units/21/invitations/TENANT/resend')
    );

    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});

