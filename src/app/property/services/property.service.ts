import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { PropertyService as BasePropertyService } from '../../services/property.service';
import { PropertyDashboardVm } from '../../shared/models/property-dashboard.model';
import { Page } from '../../models/page.model';
import { BuildingUnit } from '../../models/building/building-unit.model';
import { BuildingDocument } from '../../models/building/building-document.model';
import { BuildingIncident } from '../../models/building/building-incident.model';
import { WorkOrder } from '../../models/building/work-order.model';
import { ComplianceItem } from '../../models/building/compliance-item.model';
import { BuildingFinanceSummary } from '../../models/building/building-finance.model';
import { PropertyLinkedUser } from '../../models/property.model';
import { BuildingFinanceService } from '../../services/building/building-finance.service';
import { BuildingUnitService } from '../../services/building/building-unit.service';
import { BuildingDocumentService } from '../../services/building/building-document.service';
import { BuildingIncidentService } from '../../services/building/building-incident.service';
import { WorkOrderService } from '../../services/building/work-order.service';
import { ComplianceItemService } from '../../services/building/compliance-item.service';

@Injectable()
export class PropertyDashboardService {
  constructor(
    private readonly propertyService: BasePropertyService,
    private readonly financeService: BuildingFinanceService,
    private readonly unitService: BuildingUnitService,
    private readonly documentService: BuildingDocumentService,
    private readonly incidentService: BuildingIncidentService,
    private readonly workOrderService: WorkOrderService,
    private readonly complianceService: ComplianceItemService
  ) {}

  getPropertyDashboardVm(id: number): Observable<PropertyDashboardVm> {
    const fallbackSources: string[] = [];

    return forkJoin({
      property: this.propertyService.getPropertyById(id),
      financeSummary: this.financeService.getSummary(id).pipe(
        catchError(() => {
          fallbackSources.push('building-finance-summary');
          return of({
            buildingId: id,
            totalInvoices: 0,
            pendingInvoices: 0,
            paidInvoices: 0,
            overdueInvoices: 0,
            pendingAmount: 0,
            paidAmount: 0,
            overdueAmount: 0
          } as BuildingFinanceSummary);
        })
      ),
      unitsPage: this.unitService.getUnits(id, 0, 1000).pipe(
        catchError(() => {
          fallbackSources.push('building-units');
          return of(this.emptyPage<BuildingUnit>());
        })
      ),
      documentsPage: this.documentService.getDocuments(id, 0, 1000).pipe(
        catchError(() => {
          fallbackSources.push('building-documents');
          return of(this.emptyPage<BuildingDocument>());
        })
      ),
      incidentsPage: this.incidentService.getIncidents(id, 0, 1000).pipe(
        catchError(() => {
          fallbackSources.push('building-incidents');
          return of(this.emptyPage<BuildingIncident>());
        })
      ),
      workOrdersPage: this.workOrderService.getWorkOrders(id, 0, 1000).pipe(
        catchError(() => {
          fallbackSources.push('building-work-orders');
          return of(this.emptyPage<WorkOrder>());
        })
      ),
      compliancePage: this.complianceService.getComplianceItems(id, 0, 1000).pipe(
        catchError(() => {
          fallbackSources.push('building-compliance');
          return of(this.emptyPage<ComplianceItem>());
        })
      ),
      linkedUsers: this.propertyService.getLinkedUsers(id).pipe(
        catchError(() => {
          fallbackSources.push('property-linked-users');
          return of([] as PropertyLinkedUser[]);
        })
      )
    }).pipe(
      map(({ property, financeSummary, unitsPage, documentsPage, incidentsPage, workOrdersPage, compliancePage, linkedUsers }) => {
        const totalUnits = unitsPage.totalElements ?? unitsPage.content.length;
        const occupiedUnits = unitsPage.content.filter((unit: BuildingUnit) => unit.occupied).length;
        const vacantUnits = Math.max(totalUnits - occupiedUnits, 0);

        const incidentsOpen = incidentsPage.content.filter((incident: BuildingIncident) => incident.status !== 'CLOSED' && incident.status !== 'RESOLVED').length;
        const workOrdersOpen = workOrdersPage.content.filter((workOrder: WorkOrder) => workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED').length;
        const compliancePending = compliancePage.content.filter((item: ComplianceItem) => item.status !== 'PASSED').length;

        const recentActivity = [
          ...incidentsPage.content.slice(0, 2).map((incident: BuildingIncident) => ({
            type: 'incident' as const,
            title: incident.title,
            status: incident.status,
            timestamp: incident.updatedAt ?? incident.createdAt ?? incident.occurredAt ?? new Date(0).toISOString()
          })),
          ...workOrdersPage.content.slice(0, 2).map((workOrder: WorkOrder) => ({
            type: 'work-order' as const,
            title: workOrder.title,
            status: workOrder.status,
            timestamp: workOrder.updatedAt ?? workOrder.createdAt ?? workOrder.requestedAt ?? new Date(0).toISOString()
          })),
          ...compliancePage.content.slice(0, 2).map((item: ComplianceItem) => ({
            type: 'compliance' as const,
            title: item.title,
            status: item.status,
            timestamp: item.updatedAt ?? item.createdAt ?? item.dueDate
          })),
          ...documentsPage.content.slice(0, 2).map((document: BuildingDocument) => ({
            type: 'document' as const,
            title: document.title,
            status: document.documentType,
            timestamp: document.uploadedAt ?? new Date(0).toISOString()
          }))
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        return {
          id: property.id,
          header: {
            name: property.name,
            breadcrumbLabel: property.name,
            subtitle: property.description || (property.isBuilding ? 'Building workspace' : 'Property workspace'),
            typeLabel: property.propertyType,
            statusLabel: property.status,
            addressLabel: [property.address?.street, property.address?.number, property.address?.city, property.address?.state]
              .filter(Boolean)
              .join(' · ') || 'Address not available'
          },
          summary: {
            valuationLabel: property.isBuilding ? `Building • ${totalUnits} units` : property.propertyType,
            monthlyIncomeLabel: String(property.billing?.monthlyFee ?? property.monthlyFee ?? financeSummary.paidAmount ?? 0),
            occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
            maintenanceStatusLabel: `${workOrdersOpen + incidentsOpen + compliancePending} open issues`
          },
          sidebar: {
            locationLabel: `${property.address?.city ?? '-'} / ${property.address?.state ?? '-'}`,
            upcomingPaymentsLabel: `${financeSummary.pendingInvoices} pending · ${financeSummary.overdueInvoices} overdue`,
            alertsLabel: `${incidentsOpen} incidents · ${workOrdersOpen} work orders`,
            linkedUsers
          },
          overview: {
            totalUnits,
            occupiedUnits,
            vacantUnits,
            totalInvoices: financeSummary.totalInvoices,
            pendingInvoices: financeSummary.pendingInvoices,
            overdueInvoices: financeSummary.overdueInvoices,
            pendingAmount: financeSummary.pendingAmount,
            paidAmount: financeSummary.paidAmount,
            overdueAmount: financeSummary.overdueAmount,
            documentsCount: documentsPage.totalElements ?? documentsPage.content.length,
            incidentsOpen,
            workOrdersOpen,
            compliancePending
          },
          recentActivity,
          health: {
            degraded: fallbackSources.length > 0,
            message: fallbackSources.length > 0
              ? 'Partial data loaded. Some property data services are temporarily unavailable.'
              : 'All property data loaded successfully.',
            sources: [...fallbackSources]
          }
        };
      })
    );
  }

  private emptyPage<T>(): Page<T> {
    return {
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: 0
      },
      totalElements: 0,
      totalPages: 0,
      last: true,
      first: true,
      numberOfElements: 0
    };
  }
}


