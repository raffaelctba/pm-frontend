import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { I18nService } from '../../../services/i18n.service';
import { Property } from '../../../models/property.model';
import { canEditPropertyByRole } from '../../../shared/utils/property-permissions.util';
import { getPropertyRoleLabelKey } from '../../../shared/utils/property-role-i18n.util';

interface PropertyCardViewModel {
  id: number;
  canAccess: boolean;
  canManage: boolean;
  isBuilding: boolean;
  currentUserRole?: string;
  name: string;
  description: string;
  propertyType: string;
  status: string;
  addressLine: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  areaSize?: number;
}

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ i18n.translate('dashboard.myPropertiesTitle') }}</h1>
          <p class="mt-1 text-sm text-gray-600">{{ i18n.translate('dashboard.myPropertiesSubtitle') }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ i18n.translate('property.list.loadedCountPrefix') }} {{ propertiesCount() }}</p>
        </div>
        <a routerLink="/properties/new" class="btn btn-primary">
          {{ i18n.translate('dashboard.newProperty') }}
        </a>
      </div>

      @if (errorMessage()) {
        <div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }

      @if (loading()) {
        <div class="text-center py-8">
          <p class="text-gray-500">{{ i18n.translate('dashboard.loadingProperties') }}</p>
        </div>
      }

      @if (!loading() && propertiesCount() === 0) {
        <div class="card text-center py-8">
          <p class="text-gray-500 mb-4">{{ i18n.translate('dashboard.noPropertiesYet') }}</p>
          <a routerLink="/properties/new" class="btn btn-primary">
            {{ i18n.translate('dashboard.registerFirstProperty') }}
          </a>
        </div>
      }

      @if (!loading() && propertiesCount() > 0) {
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          @for (property of properties(); track property.id) {
            <article class="card flex h-full flex-col border border-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ property.name }}</h2>
              <p class="mt-1 text-sm text-gray-500">{{ getPropertyTypeLabel(property.propertyType) }}</p>
              <p class="mt-1 text-xs font-medium text-primary-700">
                {{ i18n.translate('property.role.label') }}: {{ i18n.translate(getRoleLabelKey(property.currentUserRole)) }}
              </p>
            </div>
            <span class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="property.isBuilding ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'">
              {{ property.isBuilding ? i18n.translate('dashboard.buildingWorkspace') : i18n.translate('dashboard.privateWorkspace') }}
            </span>
            <span [ngClass]="{
              'bg-green-100 text-green-800': property.status === 'ACTIVE',
              'bg-gray-100 text-gray-800': property.status === 'INACTIVE',
              'bg-yellow-100 text-yellow-800': property.status === 'MAINTENANCE',
              'bg-red-100 text-red-800': property.status === 'SOLD'
            }" class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold">
              {{ getStatusLabel(property.status) }}
            </span>
          </div>

          <p class="min-h-12 text-sm text-gray-600">
            {{ property.description || i18n.translate('dashboard.noDescription') }}
          </p>

          @if (property.addressLine) {
            <p class="mt-3 text-sm text-gray-500">
              {{ property.addressLine }}
            </p>
          }

          <div class="mt-4 flex flex-wrap gap-2 text-xs">
            <span *ngIf="property.bedrooms" class="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{{ property.bedrooms }} {{ i18n.translate('property.workspace.bedrooms') }}</span>
            <span *ngIf="property.bathrooms" class="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{{ property.bathrooms }} {{ i18n.translate('property.workspace.bathrooms') }}</span>
            <span *ngIf="property.parkingSpaces" class="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{{ property.parkingSpaces }} {{ i18n.translate('property.workspace.parkingSpaces') }}</span>
            <span *ngIf="property.areaSize" class="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{{ property.areaSize }}m²</span>
          </div>

          <div class="mt-6 flex gap-2">
            <a [routerLink]="getWorkspaceLink(property)" class="btn btn-primary w-full text-center" [class.opacity-50]="!property.canAccess" [attr.aria-disabled]="!property.canAccess" [style.pointer-events]="property.canAccess ? 'auto' : 'none'">
              {{ i18n.translate('dashboard.openPropertyDashboard') }}
            </a>
            <a [routerLink]="['/properties', property.id, 'edit']" class="btn btn-secondary" [class.opacity-50]="!property.canManage" [attr.aria-disabled]="!property.canManage" [style.pointer-events]="property.canManage ? 'auto' : 'none'">
              {{ i18n.translate('common.edit') }}
            </a>
            <button (click)="deleteProperty(property.id)" class="btn btn-danger" [disabled]="!property.canManage">
              {{ i18n.translate('building.units.delete') }}
            </button>
          </div>
            </article>
          }
        </div>
      }
    </div>
  `
})
export class PropertyListComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  readonly i18n = inject(I18nService);
  readonly properties = signal<PropertyCardViewModel[]>([]);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly propertiesCount = computed(() => this.properties().length);

  ngOnInit(): void {
    this.loadMyProperties();
  }

  loadMyProperties(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.propertyService.getMyProperties().subscribe({
      next: (data: Property[]) => {
        const normalized = data
          .filter((item): item is Property => !!item)
          .map((item, index) => this.toCardViewModel(item, index));

        this.properties.set(normalized);
        console.info('[PropertyList] Properties loaded:', data.length);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.errorMessage.set(error?.error?.message ?? this.i18n.translate('property.list.loadError'));
        this.loading.set(false);
      }
    });
  }

  private toCardViewModel(property: Property, index: number): PropertyCardViewModel {
    const parsedId = Number((property as { id?: unknown }).id);
    const id = Number.isFinite(parsedId) ? parsedId : -(index + 1);
    const canAccess = id > 0;
    const isBuilding = Boolean(property.isBuilding);
    const canManage = canAccess && canEditPropertyByRole(isBuilding, property.currentUserRole);

    const address = property.address;
    const addressLine = address
      ? [
          [address.street, address.number].filter(Boolean).join(', '),
          [address.city, address.state].filter(Boolean).join(' - ')
        ].filter(Boolean).join(' | ')
      : '';

    return {
      id,
      canAccess,
      canManage,
      isBuilding,
      currentUserRole: property.currentUserRole,
      name: property.name || this.i18n.translate('property.list.noName'),
      description: property.description || this.i18n.translate('property.list.noDescription'),
      propertyType: property.propertyType,
      status: property.status,
      addressLine,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parkingSpaces: property.parkingSpaces,
      areaSize: property.areaSize
    };
  }

  getWorkspaceLink(property: PropertyCardViewModel): any[] {
    return ['/property', property.id];
  }

  deleteProperty(id: number): void {
    if (confirm(this.i18n.translate('dashboard.deleteConfirm'))) {
      this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          this.loadMyProperties();
        },
        error: (error) => {
          console.error('Error deleting property:', error);
          alert(this.i18n.translate('dashboard.deleteError'));
        }
      });
    }
  }

  getPropertyTypeLabel(type: string): string {
    return this.i18n.translate(`property.type.${(type ?? '').toLowerCase()}`) || type;
  }

  getStatusLabel(status: string): string {
    return this.i18n.translate(`property.status.${(status ?? '').toLowerCase()}`) || status;
  }

  getRoleLabelKey(role?: string): string {
    return getPropertyRoleLabelKey(role);
  }
}
