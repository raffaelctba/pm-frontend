import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { PropertyService } from '../../services/property.service';
import { BuildingUnitService } from '../../services/building/building-unit.service';
import { Property, PropertyCapabilities } from '../../models/property.model';
import { BuildingUnit } from '../../models/building/building-unit.model';
import { BuildingContext, NavigationContext, UnitContext } from '../models/navigation-context.model';

type UrlPrefix = 'building' | 'property';

interface RouteIds {
  buildingId: number | null;
  unitId: number | null;
  prefix: UrlPrefix;
}

const DEFAULT_CAPABILITIES: PropertyCapabilities = {
  leaseManagement: true,
  rentalPayments: true,
  condoManagement: true,
  buildingUnits: true,
  amenities: true
};

@Injectable({ providedIn: 'root' })
export class NavigationContextService {
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly unitService = inject(BuildingUnitService);

  private readonly buildingState = signal<BuildingContext | null>(null);
  private readonly unitState = signal<UnitContext | null>(null);
  private readonly urlPrefixState = signal<UrlPrefix>('building');
  private readonly loadedBuildingId = signal<number | null>(null);
  private readonly loadedUnitKey = signal<string | null>(null);

  readonly building = computed(() => this.buildingState());
  readonly unit = computed(() => this.unitState());
  readonly urlPrefix = computed(() => this.urlPrefixState());
  readonly capabilities = computed<PropertyCapabilities>(
    () => this.buildingState()?.capabilities ?? DEFAULT_CAPABILITIES
  );

  readonly context = computed<NavigationContext>(() => {
    const unit = this.unitState();
    if (unit) {
      return { kind: 'unit', building: this.buildingState() ?? undefined, unit };
    }
    const building = this.buildingState();
    if (building) {
      return { kind: 'building', building };
    }
    return { kind: 'none' };
  });

  readonly isBuildingContext = computed(() => this.context().kind === 'building');
  readonly isUnitContext = computed(() => this.context().kind === 'unit');
  readonly isActive = computed(() => this.context().kind !== 'none');

  constructor() {
    this.syncFromRoute();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncFromRoute());
  }

  private syncFromRoute(): void {
    const ids = this.parseRoute(this.router.url);
    this.urlPrefixState.set(ids.prefix);

    if (ids.buildingId === null) {
      if (this.buildingState() !== null) {
        this.buildingState.set(null);
      }
      if (this.unitState() !== null) {
        this.unitState.set(null);
      }
      this.loadedBuildingId.set(null);
      this.loadedUnitKey.set(null);
      return;
    }

    this.loadBuildingIfNeeded(ids.buildingId);

    if (ids.unitId === null) {
      if (this.unitState() !== null) {
        this.unitState.set(null);
      }
      this.loadedUnitKey.set(null);
      return;
    }

    this.loadUnitIfNeeded(ids.buildingId, ids.unitId);
  }

  private parseRoute(url: string): RouteIds {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const buildingMatch = cleanUrl.match(/^\/(building|property)\/(\d+)/);
    const unitMatch = cleanUrl.match(/^\/(?:building|property)\/\d+\/(?:unit|units)\/(\d+)/);
    return {
      prefix: (buildingMatch?.[1] as UrlPrefix) ?? 'building',
      buildingId: buildingMatch ? Number(buildingMatch[2]) : null,
      unitId: unitMatch ? Number(unitMatch[1]) : null
    };
  }

  private loadBuildingIfNeeded(buildingId: number): void {
    if (this.loadedBuildingId() === buildingId && this.buildingState()?.buildingId === buildingId) {
      return;
    }
    this.loadedBuildingId.set(buildingId);

    this.propertyService
      .getPropertyById(buildingId)
      .pipe(
        tap((property: Property) => {
          this.buildingState.set({
            buildingId: property.id,
            buildingName: property.name,
            capabilities: property.capabilities ?? this.deriveCapabilities(property),
            currentUserRoles: this.collectRoles(property)
          });
        }),
        catchError(() => {
          this.buildingState.set({
            buildingId,
            buildingName: `Building #${buildingId}`,
            capabilities: DEFAULT_CAPABILITIES
          });
          return of(null);
        })
      )
      .subscribe();
  }

  private collectRoles(property: Property): string[] {
    const roles = new Set<string>();
    if (property.currentUserRole) {
      roles.add(property.currentUserRole);
    }
    (property.currentUserRoles ?? []).forEach((role) => roles.add(role));
    return Array.from(roles);
  }

  private loadUnitIfNeeded(buildingId: number, unitId: number): void {
    const key = `${buildingId}:${unitId}`;
    const alreadyLoaded = this.loadedUnitKey() === key && this.unitState()?.unitId === unitId;
    if (alreadyLoaded) {
      return;
    }

    // Set a tentative unit context immediately so the top menu/breadcrumb switch
    // to unit mode without waiting for HTTP. Refined below when fetches resolve.
    const tentativeBuilding: BuildingContext = this.buildingState() ?? {
      buildingId,
      buildingName: `Building #${buildingId}`,
      capabilities: DEFAULT_CAPABILITIES
    };
    this.unitState.set({
      ...tentativeBuilding,
      unitId,
      unitNumber: `#${unitId}`
    });
    this.loadedUnitKey.set(key);

    this.unitService
      .getUnit(buildingId, unitId)
      .pipe(
        switchMap((unit: BuildingUnit) => {
          const building = this.buildingState();
          if (building && building.buildingId === buildingId) {
            this.unitState.set({
              ...building,
              unitId: unit.id,
              unitNumber: unit.unitNumber
            });
            return of(unit);
          }

          return this.propertyService.getPropertyById(buildingId).pipe(
            tap((property) => {
              const buildingCtx: BuildingContext = {
                buildingId: property.id,
                buildingName: property.name,
                capabilities: property.capabilities ?? this.deriveCapabilities(property)
              };
              this.buildingState.set(buildingCtx);
              this.unitState.set({
                ...buildingCtx,
                unitId: unit.id,
                unitNumber: unit.unitNumber
              });
            }),
            catchError(() => {
              const fallback: BuildingContext = this.buildingState() ?? tentativeBuilding;
              this.unitState.set({ ...fallback, unitId: unit.id, unitNumber: unit.unitNumber });
              return of(null);
            })
          );
        }),
        catchError(() => of(null))
      )
      .subscribe();
  }

  private deriveCapabilities(property: Property): PropertyCapabilities {
    return {
      leaseManagement: property.leaseManagementEnabled ?? true,
      rentalPayments: true,
      condoManagement: property.condoManagementEnabled ?? true,
      buildingUnits: (property.totalUnits ?? 0) > 0 || property.propertyType === 'BUILDING',
      amenities: property.amenitiesEnabled ?? true
    };
  }
}
