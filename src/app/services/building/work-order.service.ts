import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';
import {
  WorkOrder,
  WorkOrderRequest,
  WorkOrderStatus,
  WorkOrderStatusUpdateRequest
} from '../../models/building/work-order.model';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/buildings`;

  getWorkOrders(buildingId: number, page: number, size: number, status?: WorkOrderStatus): Observable<Page<WorkOrder>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Page<WorkOrder>>(`${this.apiUrl}/${buildingId}/work-orders`, { params }).pipe(
      tap((response) => {
        console.info('[WorkOrderService] Retrieved work orders:', response.content.length, 'for building:', buildingId);
      })
    );
  }

  createWorkOrder(buildingId: number, payload: WorkOrderRequest): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(`${this.apiUrl}/${buildingId}/work-orders`, {
      ...payload,
      buildingId
    });
  }

  updateWorkOrder(buildingId: number, workOrderId: number, payload: WorkOrderRequest): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.apiUrl}/${buildingId}/work-orders/${workOrderId}`, {
      ...payload,
      buildingId
    });
  }

  updateWorkOrderStatus(
    buildingId: number,
    workOrderId: number,
    payload: WorkOrderStatusUpdateRequest
  ): Observable<WorkOrder> {
    return this.http.patch<WorkOrder>(`${this.apiUrl}/${buildingId}/work-orders/${workOrderId}/status`, payload);
  }

  deleteWorkOrder(buildingId: number, workOrderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${buildingId}/work-orders/${workOrderId}`);
  }
}

