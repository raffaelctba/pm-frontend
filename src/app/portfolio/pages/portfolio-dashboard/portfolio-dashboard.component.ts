import { Component, OnInit } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioDashboardVm } from '../../../shared/models/portfolio-dashboard.model';
import { NotificationCenterService } from '../../../services/notification-center.service';

@Component({
  selector: 'app-portfolio-dashboard',
  standalone: false,
  templateUrl: './portfolio-dashboard.component.html'
})
export class PortfolioDashboardComponent implements OnInit {
  loading = true;
  dashboardVm: PortfolioDashboardVm | null = null;

  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly notificationCenter: NotificationCenterService
  ) {}

  ngOnInit(): void {
    this.portfolioService.getDashboardVm().subscribe({
      next: (dashboardVm) => {
        queueMicrotask(() => {
          this.dashboardVm = dashboardVm;
          this.loading = false;

          if (dashboardVm.health.degraded) {
            this.notificationCenter.upsert({
              source: 'portfolio-dashboard',
              title: 'Portfolio dashboard partial data',
              message: dashboardVm.health.message,
              severity: 'warning'
            });
          } else {
            this.notificationCenter.clearBySource('portfolio-dashboard');
          }
        });
      },
      error: () => {
        queueMicrotask(() => {
          this.loading = false;
          this.notificationCenter.upsert({
            source: 'portfolio-dashboard',
            title: 'Portfolio dashboard unavailable',
            message: 'Unable to load portfolio dashboard data from the backend.',
            severity: 'error'
          });
        });
      }
    });
  }
}



