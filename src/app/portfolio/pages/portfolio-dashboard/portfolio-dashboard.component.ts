import { Component, OnInit } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioDashboardVm } from '../../../shared/models/portfolio-dashboard.model';
import { NotificationCenterService } from '../../../services/notification-center.service';
import { I18nService } from '../../../services/i18n.service';

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
    private readonly notificationCenter: NotificationCenterService,
    public readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.portfolioService.getDashboardVm().subscribe({
      next: (dashboardVm) => {
        this.dashboardVm = dashboardVm;
        this.loading = false;

        if (dashboardVm.health.degraded) {
          this.notificationCenter.upsert({
            source: 'portfolio-dashboard',
            title: this.i18n.translate('dashboard.partialData'),
            message: this.i18n.translate(dashboardVm.health.message),
            severity: 'warning'
          });
        } else {
          this.notificationCenter.clearBySource('portfolio-dashboard');
        }
      },
      error: () => {
        this.loading = false;
        this.notificationCenter.upsert({
          source: 'portfolio-dashboard',
          title: this.i18n.translate('dashboard.unavailable'),
          message: this.i18n.translate('dashboard.backendUnavailable'),
          severity: 'error'
        });
      }
    });
  }
}



