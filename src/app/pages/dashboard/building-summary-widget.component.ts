import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BuildingActivityItem, BuildingDashboardService, BuildingMetrics } from '../../services/building/building-dashboard.service';

@Component({
  selector: 'app-building-summary-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Building Management Summary Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Building Management</h2>
          <p class="text-sm text-gray-600 mt-1">Overview of all building operations</p>
        </div>
        <a routerLink="/properties" class="text-primary-600 hover:text-primary-800 font-medium text-sm">
          View All →
        </a>
      </div>

      <!-- Metrics Grid -->
      @if (metrics()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Incidents Card -->
          <div class="card p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-gray-600 font-medium">Critical Incidents</p>
                <p class="text-2xl font-bold text-red-600 mt-1">{{ metrics()!.incidents.critical }}</p>
              </div>
              <div class="bg-red-100 p-2 rounded-lg">
                <mat-icon class="text-red-600">warning</mat-icon>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              {{ metrics()!.incidents.total }} total incidents
            </div>
            <a routerLink="/properties" [queryParams]="{ tab: 'incidents' }" 
               class="text-primary-600 hover:text-primary-800 text-xs font-medium mt-2 inline-block">
              View Details →
            </a>
          </div>

          <!-- Work Orders Card -->
          <div class="card p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-gray-600 font-medium">Pending Work Orders</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">{{ metrics()!.workOrders.pending }}</p>
              </div>
              <div class="bg-orange-100 p-2 rounded-lg">
                <mat-icon class="text-orange-600">build</mat-icon>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              {{ metrics()!.workOrders.inProgress }} in progress
            </div>
            <a routerLink="/properties" [queryParams]="{ tab: 'work-orders' }" 
               class="text-primary-600 hover:text-primary-800 text-xs font-medium mt-2 inline-block">
              View Details →
            </a>
          </div>

          <!-- Compliance Card -->
          <div class="card p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-gray-600 font-medium">Compliance Issues</p>
                <p class="text-2xl font-bold text-yellow-600 mt-1">{{ metrics()!.compliance.pending }}</p>
              </div>
              <div class="bg-yellow-100 p-2 rounded-lg">
                <mat-icon class="text-yellow-600">assignment</mat-icon>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              {{ metrics()!.compliance.overdue }} overdue
            </div>
            <a routerLink="/properties" [queryParams]="{ tab: 'compliance' }" 
               class="text-primary-600 hover:text-primary-800 text-xs font-medium mt-2 inline-block">
              View Details →
            </a>
          </div>

          <!-- Finances Card -->
          <div class="card p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-gray-600 font-medium">Outstanding Invoices</p>
                <p class="text-2xl font-bold text-green-600 mt-1">{{ metrics()!.finances.outstanding }}</p>
              </div>
              <div class="bg-green-100 p-2 rounded-lg">
                <mat-icon class="text-green-600">receipt</mat-icon>
              </div>
            </div>
            <div class="text-xs text-gray-500">
              {{ metrics()!.finances.paid }} paid
            </div>
            <a routerLink="/invoices" 
               class="text-primary-600 hover:text-primary-800 text-xs font-medium mt-2 inline-block">
              View Details →
            </a>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Operations Status</h3>
          <div class="space-y-4">
            <!-- Incidents Progress -->
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Incident Resolution</span>
                <span class="text-sm text-gray-600">{{ getIncidentProgress() }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="getIncidentProgress()"></mat-progress-bar>
            </div>

            <!-- Work Orders Progress -->
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Work Order Completion</span>
                <span class="text-sm text-gray-600">{{ getWorkOrderProgress() }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="getWorkOrderProgress()"></mat-progress-bar>
            </div>

            <!-- Compliance Progress -->
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Compliance Status</span>
                <span class="text-sm text-gray-600">{{ getComplianceProgress() }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="getComplianceProgress()"></mat-progress-bar>
            </div>

            <!-- Invoice Payment Progress -->
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Invoice Payment Rate</span>
                <span class="text-sm text-gray-600">{{ getInvoiceProgress() }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="getInvoiceProgress()"></mat-progress-bar>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <a routerLink="/properties" class="text-primary-600 hover:text-primary-800 text-xs font-medium">See all</a>
          </div>

          @if (recentActivity().length === 0) {
            <p class="text-sm text-gray-500">No recent activity found.</p>
          } @else {
            <div class="space-y-3">
              @for (activity of recentActivity(); track activity.itemId + '-' + activity.type) {
                <div class="flex items-start justify-between rounded-lg border border-gray-100 px-3 py-2">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-gray-900">{{ activity.title }}</p>
                    <p class="text-xs uppercase tracking-wide text-gray-500">{{ activity.type }} - {{ activity.status }}</p>
                  </div>
                  <span class="ml-4 shrink-0 text-xs text-gray-500">{{ activity.timestamp | date:'short' }}</span>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (loading()) {
        <div class="text-center py-8">
          <p class="text-gray-500">Loading building metrics...</p>
        </div>
      }
    </div>
  `
})
export class BuildingSummaryWidgetComponent implements OnInit {
  private buildingDashboardService = inject(BuildingDashboardService);

  metrics = signal<BuildingMetrics | null>(null);
  recentActivity = signal<BuildingActivityItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadMetrics();
  }

  private loadMetrics(): void {
    this.buildingDashboardService.getBuildingMetrics().subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.metrics.set(data);
          this.loading.set(false);
        });
      },
      error: (error) => {
        console.error('Error loading building metrics:', error);
        queueMicrotask(() => {
          this.loading.set(false);
        });
      }
    });

    this.buildingDashboardService.getRecentActivity(5).subscribe({
      next: (activity) => queueMicrotask(() => this.recentActivity.set(activity)),
      error: (error) => console.error('Error loading recent activity:', error)
    });
  }

  getIncidentProgress(): number {
    if (!this.metrics()) return 0;
    const m = this.metrics()!;
    const total = m.incidents.total;
    if (total === 0) return 100;
    return Math.round(((total - m.incidents.critical) / total) * 100);
  }

  getWorkOrderProgress(): number {
    if (!this.metrics()) return 0;
    const m = this.metrics()!;
    const total = m.workOrders.total;
    if (total === 0) return 100;
    return Math.round((m.workOrders.inProgress / total) * 100);
  }

  getComplianceProgress(): number {
    if (!this.metrics()) return 0;
    const m = this.metrics()!;
    const total = m.compliance.total;
    if (total === 0) return 100;
    return Math.round(((total - m.compliance.pending) / total) * 100);
  }

  getInvoiceProgress(): number {
    if (!this.metrics()) return 0;
    const m = this.metrics()!;
    const total = m.finances.totalInvoices;
    if (total === 0) return 100;
    return Math.round((m.finances.paid / total) * 100);
  }
}


