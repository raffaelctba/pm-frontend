import { Routes } from '@angular/router';
import { BuildingShellComponent } from './components/building-shell/building-shell.component';
import { SectionPlaceholderComponent } from './pages/section-placeholder/section-placeholder.component';

export const BUILDING_ROUTES: Routes = [
  {
    path: '',
    component: BuildingShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../property/pages/property-dashboard/property-dashboard.component').then(
            (m) => m.PropertyDashboardComponent
          ),
        data: { menu: 'overview' }
      },
      {
        path: 'units',
        loadComponent: () =>
          import('../pages/buildings/units/building-units.component').then(
            (m) => m.BuildingUnitsComponent
          ),
        data: { menu: 'units' }
      },
      {
        path: 'amenities',
        loadComponent: () =>
          import('../pages/buildings/amenities/building-amenities.component').then(
            (m) => m.BuildingAmenitiesComponent
          ),
        data: { menu: 'amenities' }
      },
      {
        path: 'maintenance',
        loadComponent: () =>
          import('../pages/buildings/maintenance/building-maintenance.component').then(
            (m) => m.BuildingMaintenanceComponent
          ),
        data: { menu: 'maintenance' }
      },
      {
        path: 'maintenance-history',
        loadComponent: () =>
          import('../pages/buildings/maintenance/building-maintenance.component').then(
            (m) => m.BuildingMaintenanceComponent
          ),
        data: { menu: 'maintenance-history', historyOnly: true }
      },
      {
        path: 'work-orders',
        loadComponent: () =>
          import('../pages/buildings/work-orders/building-work-orders.component').then(
            (m) => m.BuildingWorkOrdersComponent
          ),
        data: { menu: 'maintenance' }
      },
      {
        path: 'finances',
        loadComponent: () =>
          import('../pages/buildings/finances/building-finances.component').then(
            (m) => m.BuildingFinancesComponent
          ),
        data: { menu: 'financials' }
      },
      {
        path: 'reservations',
        component: SectionPlaceholderComponent,
        data: { menu: 'reservations', title: 'Reservations' }
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('../pages/buildings/documents/building-documents.component').then(
            (m) => m.BuildingDocumentsComponent
          ),
        data: { menu: 'documents' }
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../pages/buildings/users/building-users.component').then(
            (m) => m.BuildingUsersComponent
          ),
        data: { menu: 'users' }
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../pages/properties/property-form/property-form.component').then(
            (m) => m.PropertyFormComponent
          ),
        data: { menu: 'settings' }
      },
      {
        path: 'edit',
        loadComponent: () =>
          import('../pages/properties/property-form/property-form.component').then(
            (m) => m.PropertyFormComponent
          ),
        data: { menu: 'settings' }
      },

      {
        path: 'unit/:unitId',
        loadComponent: () =>
          import('../pages/buildings/units/building-unit-dashboard.component').then(
            (m) => m.UnitDashboardComponent
          ),
        data: { menu: 'unit-overview', title: 'Unit Overview' }
      },
      {
        path: 'unit/:unitId/lease',
        loadComponent: () =>
          import('../pages/buildings/leases/building-leases.component').then(
            (m) => m.BuildingLeasesComponent
          ),
        data: { menu: 'lease', title: 'Lease' }
      },
      {
        path: 'unit/:unitId/tenants',
        component: SectionPlaceholderComponent,
        data: { menu: 'tenants', title: 'Tenants' }
      },
      {
        path: 'unit/:unitId/payments',
        component: SectionPlaceholderComponent,
        data: { menu: 'payments', title: 'Payments' }
      },
      {
        path: 'unit/:unitId/payment-history',
        component: SectionPlaceholderComponent,
        data: { menu: 'payment-history', title: 'Payment History' }
      },
      {
        path: 'unit/:unitId/maintenance',
        loadComponent: () =>
          import('../pages/buildings/maintenance/building-maintenance.component').then(
            (m) => m.BuildingMaintenanceComponent
          ),
        data: { menu: 'unit-maintenance', title: 'Unit Maintenance' }
      },
      {
        path: 'unit/:unitId/private-maintenance',
        loadComponent: () =>
          import('../pages/buildings/private-maintenance/private-unit-maintenance.component').then(
            (m) => m.PrivateUnitMaintenanceComponent
          ),
        data: { menu: 'unit-private-maintenance', title: 'Private Maintenance' }
      },
      {
        path: 'unit/:unitId/private-maintenance-history',
        loadComponent: () =>
          import('../pages/buildings/private-maintenance/private-unit-maintenance.component').then(
            (m) => m.PrivateUnitMaintenanceComponent
          ),
        data: {
          menu: 'unit-private-maintenance-history',
          title: 'Private Maintenance History',
          historyOnly: true
        }
      },
      {
        path: 'unit/:unitId/users',
        loadComponent: () =>
          import('../pages/buildings/users/unit-users.component').then((m) => m.UnitUsersComponent),
        data: { menu: 'unit-users', title: 'Unit Users' }
      },
      {
        path: 'unit/:unitId/documents',
        component: SectionPlaceholderComponent,
        data: { menu: 'unit-documents', title: 'Unit Documents' }
      },
      {
        path: 'unit/:unitId/settings',
        component: SectionPlaceholderComponent,
        data: { menu: 'unit-settings', title: 'Unit Settings' }
      }
    ]
  }
];
