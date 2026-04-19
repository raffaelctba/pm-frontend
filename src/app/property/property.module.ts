import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PropertyRoutingModule } from './property-routing.module';
import { PropertyDashboardComponent } from './pages/property-dashboard/property-dashboard.component';
import { PropertyHeaderComponent } from './components/property-header/property-header.component';
import { PropertySummaryCardsComponent } from './components/property-summary-cards/property-summary-cards.component';
import { PropertyTabsComponent } from './components/property-tabs/property-tabs.component';
import { PropertySidebarComponent } from './components/property-sidebar/property-sidebar.component';
import { PropertyDashboardService } from './services/property.service';
import { BreadcrumbsComponent } from './components/property-header/breadcrumbs/breadcrumbs.component';
import { PropertyActionsComponent } from './components/property-header/property-actions/property-actions.component';
import { ValuationCardComponent } from './components/property-summary-cards/valuation-card/valuation-card.component';
import { MonthlyIncomeCardComponent } from './components/property-summary-cards/monthly-income-card/monthly-income-card.component';
import { OccupancyCardComponent } from './components/property-summary-cards/occupancy-card/occupancy-card.component';
import { MaintenanceStatusCardComponent } from './components/property-summary-cards/maintenance-status-card/maintenance-status-card.component';
import { PropertyDetailsPanelComponent } from './components/property-tabs/overview-tab/property-details-panel/property-details-panel.component';
import { UnitsOverviewComponent } from './components/property-tabs/overview-tab/units-overview/units-overview.component';
import { FinancialSnapshotComponent } from './components/property-tabs/overview-tab/financial-snapshot/financial-snapshot.component';
import { ActivityTimelineComponent } from './components/property-tabs/overview-tab/activity-timeline/activity-timeline.component';
import { UnitsTableComponent } from './components/property-tabs/units-tab/units-table/units-table.component';
import { UnitCardComponent } from './components/property-tabs/units-tab/unit-card/unit-card.component';
import { IncomeTableComponent } from './components/property-tabs/financials-tab/income-table/income-table.component';
import { ExpensesTableComponent } from './components/property-tabs/financials-tab/expenses-table/expenses-table.component';
import { FinancialChartsComponent } from './components/property-tabs/financials-tab/financial-charts/financial-charts.component';
import { MaintenanceListComponent } from './components/property-tabs/maintenance-tab/maintenance-list/maintenance-list.component';
import { MaintenanceFiltersComponent } from './components/property-tabs/maintenance-tab/maintenance-filters/maintenance-filters.component';
import { CreateMaintenanceRequestButtonComponent } from './components/property-tabs/maintenance-tab/create-maintenance-request-button/create-maintenance-request-button.component';
import { DocumentsListComponent } from './components/property-tabs/documents-tab/documents-list/documents-list.component';
import { DocumentUploaderComponent } from './components/property-tabs/documents-tab/document-uploader/document-uploader.component';
import { DocumentViewerComponent } from './components/property-tabs/documents-tab/document-viewer/document-viewer.component';
import { QuickStatsComponent } from './components/property-sidebar/quick-stats/quick-stats.component';
import { UpcomingPaymentsComponent } from './components/property-sidebar/upcoming-payments/upcoming-payments.component';
import { AlertsComponent } from './components/property-sidebar/alerts/alerts.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    PropertyDashboardComponent,
    PropertyHeaderComponent,
    PropertySummaryCardsComponent,
    PropertyTabsComponent,
    PropertySidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    PropertyRoutingModule,
    BreadcrumbsComponent,
    PropertyActionsComponent,
    ValuationCardComponent,
    MonthlyIncomeCardComponent,
    OccupancyCardComponent,
    MaintenanceStatusCardComponent,
    PropertyDetailsPanelComponent,
    UnitsOverviewComponent,
    FinancialSnapshotComponent,
    ActivityTimelineComponent,
    UnitsTableComponent,
    UnitCardComponent,
    IncomeTableComponent,
    ExpensesTableComponent,
    FinancialChartsComponent,
    MaintenanceListComponent,
    MaintenanceFiltersComponent,
    CreateMaintenanceRequestButtonComponent,
    DocumentsListComponent,
    DocumentUploaderComponent,
    DocumentViewerComponent,
    QuickStatsComponent,
    UpcomingPaymentsComponent,
    AlertsComponent,
    DragDropModule
  ],
  providers: [PropertyDashboardService]
})
export class PropertyModule {}


