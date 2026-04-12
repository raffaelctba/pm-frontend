import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyDashboardComponent } from './pages/property-dashboard/property-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: PropertyDashboardComponent
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
    path: 'work-orders',
    loadComponent: () => import('../pages/buildings/work-orders/building-work-orders.component').then(m => m.BuildingWorkOrdersComponent)
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyRoutingModule {}


