import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BuildingActivityItem {
  type: 'incident' | 'work-order' | 'compliance' | 'document';
  title: string;
  timestamp: Date;
  status: string;
  buildingId: number;
  itemId: number;
}

export interface BuildingDashboardSummary {
  totalBuildings: number;
  criticalIncidents: number;
  pendingWorkOrders: number;
  pendingCompliance: number;
  invoicesDue: number;
  recentActivity: BuildingActivityItem[];
}

export interface BuildingMetrics {
  incidents: {
    total: number;
    critical: number;
    pending: number;
  };
  workOrders: {
    total: number;
    pending: number;
    inProgress: number;
  };
  compliance: {
    total: number;
    pending: number;
    overdue: number;
  };
  finances: {
    totalInvoices: number;
    paid: number;
    outstanding: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BuildingDashboardService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  constructor(private http: HttpClient) {}

  /**
   * Get consolidated metrics for all buildings
   */
  getBuildingMetrics(): Observable<BuildingMetrics> {
    return this.http.get<BuildingMetrics>(`${this.apiUrl}/metrics`);
  }

  /**
   * Get recent activity across all buildings
   */
  getRecentActivity(limit: number = 10): Observable<BuildingActivityItem[]> {
    return this.http
      .get<Array<Omit<BuildingActivityItem, 'timestamp'> & { timestamp: string }>>(
        `${this.apiUrl}/activity/recent?limit=${limit}`
      )
      .pipe(
        map((items) =>
          items.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }))
        )
      );
  }

  /**
   * Get dashboard summary (consolidates all metrics and activity)
   */
  getDashboardSummary(): Observable<BuildingDashboardSummary> {
    return combineLatest([
      this.getRecentActivity(5),
      this.getBuildingMetrics()
    ]).pipe(
      map(([activity, metrics]: [BuildingActivityItem[], BuildingMetrics]) => {
        return {
          totalBuildings: 0, // Will be calculated from metrics
          criticalIncidents: metrics.incidents.critical,
          pendingWorkOrders: metrics.workOrders.pending,
          pendingCompliance: metrics.compliance.pending,
          invoicesDue: metrics.finances.outstanding,
          recentActivity: activity
        };
      })
    );
  }
}




