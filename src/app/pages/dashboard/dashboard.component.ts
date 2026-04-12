import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { DashboardContextService } from '../../services/dashboard-context.service';
import { I18nService } from '../../services/i18n.service';
import { Property } from '../../models/property.model';
import { BuildingSummaryWidgetComponent } from './building-summary-widget.component';
import { getPropertyRoleLabelKey } from '../../shared/utils/property-role-i18n.util';
import { canEditPropertyByRole } from '../../shared/utils/property-permissions.util';

interface DashboardPropertyViewModel extends Property {
  canManage: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BuildingSummaryWidgetComponent],
  template: `
    <div class="px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ i18n.translate('dashboard.globalTitle') }}</h1>
      <p class="mb-8 text-sm text-gray-600">{{ i18n.translate('dashboard.globalSubtitle') }}</p>

      <!-- Building Management Section -->
      <div class="mb-8">
        <app-building-summary-widget></app-building-summary-widget>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm text-gray-500">{{ i18n.translate('dashboard.totalProperties') }}</p>
              <p class="text-3xl font-bold text-primary-600">{{ properties.length }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm text-gray-500">{{ i18n.translate('dashboard.pendingInvoices') }}</p>
              <p class="text-3xl font-bold text-yellow-600">0</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm text-gray-500">{{ i18n.translate('dashboard.unreadMessages') }}</p>
              <p class="text-3xl font-bold text-red-600">0</p>
            </div>
          </div>
        </div>
      </div>

      <!-- My Properties -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ i18n.translate('dashboard.myPropertiesTitle') }}</h2>
          <a routerLink="/properties/new" class="btn btn-primary">
            {{ i18n.translate('dashboard.newProperty') }}
          </a>
        </div>

        <div *ngIf="loading" class="text-center py-8">
          <p class="text-gray-500">{{ i18n.translate('dashboard.loadingProperties') }}</p>
        </div>

        <div *ngIf="!loading && properties.length === 0" class="text-center py-8">
          <p class="text-gray-500">{{ i18n.translate('dashboard.noPropertiesYet') }}</p>
          <a routerLink="/properties/new" class="btn btn-primary mt-4">
            {{ i18n.translate('dashboard.registerFirstProperty') }}
          </a>
        </div>

        <div *ngIf="!loading && properties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let property of properties" class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ property.name }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ getPropertyTypeLabel(property.propertyType) }}</p>
              <p class="text-xs text-primary-700 font-medium mb-2">
                {{ i18n.translate('property.role.label') }}: {{ i18n.translate(getRoleLabelKey(property.currentUserRole)) }}
              </p>
              <p class="text-xs font-medium mb-2" [ngClass]="property.isBuilding ? 'text-indigo-600' : 'text-emerald-600'">
                {{ property.isBuilding ? i18n.translate('dashboard.buildingWorkspace') : i18n.translate('dashboard.privateWorkspace') }}
              </p>
            <p class="text-sm text-gray-500 mb-4" *ngIf="property.address">
              {{ property.address.city }}, {{ property.address.state }}
            </p>
            <div class="flex justify-between">
              <a [routerLink]="['/property', property.id]" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                {{ i18n.translate('dashboard.openPropertyDashboard') }}
              </a>
              <span [ngClass]="{
                'bg-green-100 text-green-800': property.status === 'ACTIVE',
                'bg-gray-100 text-gray-800': property.status === 'INACTIVE',
                'bg-yellow-100 text-yellow-800': property.status === 'MAINTENANCE',
                'bg-red-100 text-red-800': property.status === 'SOLD'
              }" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ getStatusLabel(property.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  properties: DashboardPropertyViewModel[] = [];
  loading = true;

  constructor(
    private propertyService: PropertyService,
    private dashboardContext: DashboardContextService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.dashboardContext.setGlobal();
    this.loadProperties();
  }

  loadProperties(): void {
    this.propertyService.getMyProperties().subscribe({
      next: (data) => {
        // Some providers can emit synchronously on init; defer state update to avoid NG0100 in dev mode.
        queueMicrotask(() => {
          this.properties = data.map((property) => ({
            ...property,
            canManage: canEditPropertyByRole(Boolean(property.isBuilding), property.currentUserRole)
          }));
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        queueMicrotask(() => {
          this.loading = false;
        });
      }
    });
  }

  getRoleLabelKey(role?: string): string {
    return getPropertyRoleLabelKey(role);
  }

  getPropertyTypeLabel(type?: string): string {
    return this.i18n.translate(`property.type.${(type ?? '').toLowerCase()}`);
  }

  getStatusLabel(status?: string): string {
    return this.i18n.translate(`property.status.${(status ?? '').toLowerCase()}`);
  }
}
