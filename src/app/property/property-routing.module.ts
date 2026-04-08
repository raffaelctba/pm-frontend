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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyRoutingModule {}


