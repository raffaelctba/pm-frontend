import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { PropertyService } from '../../services/property.service';
import { BuildingDashboardService, BuildingMetrics } from '../../services/building/building-dashboard.service';
import { PortfolioActivityVm, PortfolioDashboardVm, PortfolioPropertyCardVm, PortfolioStatsVm } from '../../shared/models/portfolio-dashboard.model';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly buildingDashboardService: BuildingDashboardService
  ) {}

  getDashboardVm(): Observable<PortfolioDashboardVm> {
    const fallbackSources: string[] = [];

    return forkJoin({
      properties: this.propertyService.getMyProperties(),
      metrics: this.buildingDashboardService.getBuildingMetrics().pipe(
        catchError(() => {
          fallbackSources.push('building-metrics');
          return of(this.emptyMetrics());
        })
      ),
      activity: this.buildingDashboardService.getRecentActivity(8).pipe(
        catchError(() => {
          fallbackSources.push('building-activity');
          return of([]);
        })
      )
    }).pipe(
      map(({ properties, metrics, activity }) => {
        const total = properties.length;
        const buildingCount = properties.filter((p) => p.isBuilding).length;
        const privateCount = total - buildingCount;
        const openMaintenanceRequests = metrics.incidents.pending + metrics.workOrders.pending + metrics.compliance.pending;

        const stats: PortfolioStatsVm = {
          totalProperties: total,
          buildingCount,
          privateCount,
          occupancyRate: total > 0 ? Math.round((privateCount / total) * 100) : 0,
          totalIncome: properties.reduce((sum, property) => sum + Number(property.billing?.monthlyFee ?? property.monthlyFee ?? 0), 0),
          openMaintenanceRequests,
          outstandingInvoices: metrics.finances.outstanding,
          paidInvoices: metrics.finances.paid,
          criticalIncidents: metrics.incidents.critical,
          pendingWorkOrders: metrics.workOrders.pending,
          pendingCompliance: metrics.compliance.pending
        };

        const propertyCards: PortfolioPropertyCardVm[] = properties.map((property) => ({
          id: property.id,
          name: property.name,
          propertyType: property.propertyType,
          currentUserRole: property.currentUserRole
        }));

        return {
          stats,
          properties: propertyCards,
          recentActivity: activity.map((item): PortfolioActivityVm => ({
            type: item.type,
            title: item.title,
            status: item.status,
            timestamp: item.timestamp.toISOString()
          })),
          health: {
            degraded: fallbackSources.length > 0,
            message: fallbackSources.length > 0
              ? 'portfolio.health.partialData'
              : 'portfolio.health.allData',
            sources: [...fallbackSources]
          }
        };
      })
    );
  }

  private emptyMetrics(): BuildingMetrics {
    return {
      incidents: { total: 0, critical: 0, pending: 0 },
      workOrders: { total: 0, pending: 0, inProgress: 0 },
      compliance: { total: 0, pending: 0, overdue: 0 },
      finances: { totalInvoices: 0, paid: 0, outstanding: 0 }
    };
  }
}


