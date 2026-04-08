import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioDashboardComponent } from './pages/portfolio-dashboard/portfolio-dashboard.component';
import { PortfolioHeaderComponent } from './components/portfolio-header/portfolio-header.component';
import { PortfolioSummaryCardsComponent } from './components/portfolio-summary-cards/portfolio-summary-cards.component';
import { PropertiesListComponent } from './components/properties-list/properties-list.component';
import { PortfolioFinancialChartsComponent } from './components/portfolio-financial-charts/portfolio-financial-charts.component';
import { PortfolioMaintenanceComponent } from './components/portfolio-maintenance/portfolio-maintenance.component';
import { PortfolioService } from './services/portfolio.service';
import { TotalPropertiesCardComponent } from './components/portfolio-summary-cards/total-properties-card/total-properties-card.component';
import { TotalIncomeCardComponent } from './components/portfolio-summary-cards/total-income-card/total-income-card.component';
import { OccupancyRateCardComponent } from './components/portfolio-summary-cards/occupancy-rate-card/occupancy-rate-card.component';
import { MaintenanceOverviewCardComponent } from './components/portfolio-summary-cards/maintenance-overview-card/maintenance-overview-card.component';
import { PropertyCardComponent } from './components/properties-list/property-card/property-card.component';
import { IncomeExpensesChartComponent } from './components/portfolio-financial-charts/income-expenses-chart/income-expenses-chart.component';
import { CashflowTrendChartComponent } from './components/portfolio-financial-charts/cashflow-trend-chart/cashflow-trend-chart.component';
import { MaintenanceTableComponent } from './components/portfolio-maintenance/maintenance-table/maintenance-table.component';
import { MaintenanceStatusFiltersComponent } from './components/portfolio-maintenance/maintenance-status-filters/maintenance-status-filters.component';

@NgModule({
  declarations: [
    PortfolioDashboardComponent,
    PortfolioHeaderComponent,
    PortfolioSummaryCardsComponent,
    PropertiesListComponent,
    PortfolioFinancialChartsComponent,
    PortfolioMaintenanceComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    PortfolioRoutingModule,
    TotalPropertiesCardComponent,
    TotalIncomeCardComponent,
    OccupancyRateCardComponent,
    MaintenanceOverviewCardComponent,
    PropertyCardComponent,
    IncomeExpensesChartComponent,
    CashflowTrendChartComponent,
    MaintenanceTableComponent,
    MaintenanceStatusFiltersComponent
  ],
  providers: [PortfolioService]
})
export class PortfolioModule {}


