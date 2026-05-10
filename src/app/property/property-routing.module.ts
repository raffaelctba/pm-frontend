import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyDashboardComponent } from './pages/property-dashboard/property-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: PropertyDashboardComponent
  },
  {
    path: 'edit',
    loadComponent: () => import('../pages/properties/property-form/property-form.component').then(m => m.PropertyFormComponent)
  },
  {
    path: 'workspace',
    loadComponent: () => import('../pages/properties/property-management/property-management.component').then(m => m.PropertyManagementComponent)
  },
  {
    path: 'units',
    loadComponent: () => import('../pages/buildings/units/building-units.component').then(m => m.BuildingUnitsComponent)
  },
  {
    path: 'units/:unitId',
    loadComponent: () => import('../pages/buildings/units/building-unit-dashboard.component').then(m => m.UnitDashboardComponent)
  },
  {
    path: 'leases',
    loadComponent: () => import('../pages/buildings/leases/building-leases.component').then(m => m.BuildingLeasesComponent)
  },
  {
    path: 'units/:unitId/leases',
    loadComponent: () => import('../pages/buildings/leases/building-leases.component').then(m => m.BuildingLeasesComponent)
  },
  {
    path: 'units/:unitId/tenants',
    loadComponent: () => import('../navigation/pages/section-placeholder/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
    data: { menu: 'tenants', title: 'Tenants' }
  },
  {
    path: 'units/:unitId/payments',
    loadComponent: () => import('../navigation/pages/section-placeholder/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
    data: { menu: 'payments', title: 'Payments' }
  },
  {
    path: 'units/:unitId/payment-history',
    loadComponent: () => import('../navigation/pages/section-placeholder/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
    data: { menu: 'payment-history', title: 'Payment History' }
  },
  {
    path: 'units/:unitId/maintenance',
    loadComponent: () => import('../pages/buildings/maintenance/building-maintenance.component').then(m => m.BuildingMaintenanceComponent),
    data: { menu: 'unit-maintenance', title: 'Unit Maintenance' }
  },
  {
    path: 'units/:unitId/private-maintenance',
    loadComponent: () => import('../pages/buildings/private-maintenance/private-unit-maintenance.component').then(m => m.PrivateUnitMaintenanceComponent),
    data: { menu: 'unit-private-maintenance', title: 'Private Maintenance' }
  },
  {
    path: 'units/:unitId/private-maintenance-history',
    loadComponent: () => import('../pages/buildings/private-maintenance/private-unit-maintenance.component').then(m => m.PrivateUnitMaintenanceComponent),
    data: { menu: 'unit-private-maintenance-history', title: 'Private Maintenance History', historyOnly: true }
  },
  {
    path: 'units/:unitId/documents',
    loadComponent: () => import('../navigation/pages/section-placeholder/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
    data: { menu: 'unit-documents', title: 'Unit Documents' }
  },
  {
    path: 'units/:unitId/settings',
    loadComponent: () => import('../navigation/pages/section-placeholder/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
    data: { menu: 'unit-settings', title: 'Unit Settings' }
  },
  {
    path: 'work-orders',
    loadComponent: () => import('../pages/buildings/work-orders/building-work-orders.component').then(m => m.BuildingWorkOrdersComponent)
  },
  {
    path: 'maintenance',
    loadComponent: () => import('../pages/buildings/maintenance/building-maintenance.component').then(m => m.BuildingMaintenanceComponent),
    data: { menu: 'maintenance' }
  },
  {
    path: 'maintenance-history',
    loadComponent: () => import('../pages/buildings/maintenance/building-maintenance.component').then(m => m.BuildingMaintenanceComponent),
    data: { menu: 'maintenance-history', historyOnly: true }
  },
  {
    path: 'compliance',
    loadComponent: () => import('../pages/buildings/compliance/building-compliance.component').then(m => m.BuildingComplianceComponent)
  },
  {
    path: 'documents',
    loadComponent: () => import('../pages/buildings/documents/building-documents.component').then(m => m.BuildingDocumentsComponent)
  },
  {
    path: 'incidents',
    loadComponent: () => import('../pages/buildings/incidents/building-incidents.component').then(m => m.BuildingIncidentsComponent)
  },
  {
    path: 'finances',
    loadComponent: () => import('../pages/buildings/finances/building-finances.component').then(m => m.BuildingFinancesComponent)
  },
  {
    path: 'reservations',
    loadComponent: () => import('../navigation/pages/section-placeholder/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
    data: { menu: 'reservations', title: 'Reservations' }
  },
  {
    path: 'billing',
    loadComponent: () => import('../pages/buildings/billing/billing-dashboard.component').then(m => m.BillingDashboardComponent)
  },
  {
    path: 'billing/charges',
    loadComponent: () => import('../pages/buildings/billing/charge-management.component').then(m => m.ChargeManagementComponent)
  },
  {
    path: 'billing/statements',
    loadComponent: () => import('../pages/buildings/billing/billing-statement.component').then(m => m.BillingStatementComponent)
  },
  {
    path: 'billing/payments',
    loadComponent: () => import('../pages/buildings/billing/payment-entry.component').then(m => m.PaymentEntryComponent)
  },
  {
    path: 'billing/approvals',
    loadComponent: () => import('../pages/buildings/billing/approval-queue.component').then(m => m.ApprovalQueueComponent)
  },
  {
    path: 'billing/reconciliation',
    loadComponent: () => import('../pages/buildings/billing/reconciliation.component').then(m => m.ReconciliationComponent)
  },
  {
    path: 'amenities',
    loadComponent: () => import('../pages/buildings/amenities/building-amenities.component').then(m => m.BuildingAmenitiesComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('../pages/buildings/users/building-users.component').then(m => m.BuildingUsersComponent),
    data: { menu: 'users' }
  },
  {
    path: 'units/:unitId/users',
    loadComponent: () => import('../pages/buildings/users/unit-users.component').then(m => m.UnitUsersComponent),
    data: { menu: 'unit-users', title: 'Unit Users' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyRoutingModule {}

