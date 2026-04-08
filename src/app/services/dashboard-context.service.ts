import { Injectable, computed, signal } from '@angular/core';
import { Property } from '../models/property.model';

export type DashboardContextMode = 'global' | 'property';

@Injectable({
  providedIn: 'root'
})
export class DashboardContextService {
  private readonly modeState = signal<DashboardContextMode>('global');
  private readonly propertyState = signal<Property | null>(null);
  private readonly propertyIdState = signal<number | null>(null);

  readonly mode = computed(() => this.modeState());
  readonly property = computed(() => this.propertyState());
  readonly propertyId = computed(() => this.propertyIdState());
  readonly isGlobal = computed(() => this.modeState() === 'global');
  readonly isProperty = computed(() => this.modeState() === 'property');
  readonly workspaceManagementLabelKey = computed(() =>
    this.propertyState()?.isBuilding
      ? 'property.workspace.buildingManagement'
      : 'property.workspace.privateManagement'
  );

  setGlobal(): void {
    this.modeState.set('global');
    this.propertyState.set(null);
    this.propertyIdState.set(null);
  }

  setPropertyContext(propertyId: number): void {
    if (this.propertyState()?.id !== propertyId) {
      this.propertyState.set(null);
    }

    this.modeState.set('property');
    this.propertyIdState.set(propertyId);
  }

  setProperty(property: Property): void {
    this.modeState.set('property');
    this.propertyState.set(property);
    this.propertyIdState.set(property.id ?? null);
  }

  clearProperty(): void {
    this.propertyState.set(null);
  }
}

