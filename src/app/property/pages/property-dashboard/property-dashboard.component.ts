import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { asyncScheduler, catchError, map, Observable, observeOn, of, startWith, switchMap, tap } from 'rxjs';
import { DashboardContextService } from '../../../services/dashboard-context.service';
import { PropertyDashboardService } from '../../services/property.service';
import { PropertyDashboardVm } from '../../../shared/models/property-dashboard.model';
import { NotificationCenterService } from '../../../services/notification-center.service';

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

  readonly state$: Observable<{ loading: boolean; dashboardVm: PropertyDashboardVm | null }> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) => {
      if (!Number.isFinite(id) || id <= 0) {
        return of({ loading: false, dashboardVm: null }).pipe(observeOn(asyncScheduler));
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
        startWith({ loading: true, dashboardVm: null }),
        observeOn(asyncScheduler)
      );
    })
  );

  private syncHealthNotification(dashboardVm: PropertyDashboardVm): void {
    queueMicrotask(() => {
      if (dashboardVm.health.degraded) {
        this.notificationCenter.upsert({
          source: `property-dashboard-${dashboardVm.id}`,
          title: 'Property dashboard partial data',
          message: dashboardVm.health.message,
          severity: 'warning'
        });
      } else {
        this.notificationCenter.clearBySource(`property-dashboard-${dashboardVm.id}`);
      }
    });
  }

  private showUnavailableNotification(id: number): void {
    queueMicrotask(() => {
      this.notificationCenter.upsert({
        source: `property-dashboard-${id}`,
        title: 'Property dashboard unavailable',
        message: 'Unable to load property dashboard data from the backend.',
        severity: 'error'
      });
    });
  }
}



