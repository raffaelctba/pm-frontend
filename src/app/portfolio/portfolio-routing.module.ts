import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioDashboardComponent } from './pages/portfolio-dashboard/portfolio-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: PortfolioDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioRoutingModule {}

