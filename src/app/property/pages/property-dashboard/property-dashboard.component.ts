import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { DashboardContextService } from '../../../services/dashboard-context.service';
import { PropertyDashboardService } from '../../services/property.service';
import { PropertyDashboardVm } from '../../../shared/models/property-dashboard.model';
import { NotificationCenterService } from '../../../services/notification-center.service';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-property-dashboard',
  standalone: false,
  templateUrl: './property-dashboard.component.html'
})
export class PropertyDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyDashboardService = inject(PropertyDashboardService);
  private readonly dashboardContext = inject(DashboardContextService);
  private readonly notificationCenter = inject(NotificationCenterService);
  readonly i18n = inject(I18nService);

  readonly state$: Observable<{ loading: boolean; dashboardVm: PropertyDashboardVm | null }> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) => {
      if (!Number.isFinite(id) || id <= 0) {
        return of({ loading: false, dashboardVm: null });
      }

      this.dashboardContext.setPropertyContext(id);

      return this.propertyDashboardService.getPropertyDashboardVm(id).pipe(
        map((dashboardVm) => ({ loading: false, dashboardVm })),
        tap(({ dashboardVm }) => {
          if (dashboardVm) {
            this.dashboardContext.setPropertyContext(dashboardVm.id);
            this.syncHealthNotification(dashboardVm);
          }
        }),
        catchError(() => {
          this.showUnavailableNotification(id);
          return of({ loading: false, dashboardVm: null });
        }),
        startWith({ loading: true, dashboardVm: null })
      );
    })
  );

  private syncHealthNotification(dashboardVm: PropertyDashboardVm): void {
    if (dashboardVm.health.degraded) {
      this.notificationCenter.upsert({
        source: `property-dashboard-${dashboardVm.id}`,
        title: this.i18n.translate('dashboard.partialData'),
        message: dashboardVm.health.message,
        severity: 'warning'
      });
    } else {
      this.notificationCenter.clearBySource(`property-dashboard-${dashboardVm.id}`);
    }
  }

  private showUnavailableNotification(id: number): void {
    this.notificationCenter.upsert({
      source: `property-dashboard-${id}`,
      title: this.i18n.translate('dashboard.unavailable'),
      message: this.i18n.translate('dashboard.backendUnavailable'),
      severity: 'error'
    });
  }
}



