import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

export interface BuildingAlertEvent {
  type: string;
  buildingId: number;
  sensorType?: string;
  source?: string;
  value?: number;
  threshold?: number;
  unit?: string;
  level?: string;
  occurredAt: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class BuildingRealtimeService {
  private readonly sseBaseUrl = `${environment.apiBaseUrl}/api/buildings`;
  private readonly eventsSubject = new Subject<BuildingAlertEvent>();
  private active = false;
  private abortController: AbortController | null = null;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private activeBuildingId: number | null = null;

  constructor(private readonly authService: AuthService) {}

  events$(): Observable<BuildingAlertEvent> {
    return this.eventsSubject.asObservable();
  }

  connectToBuildingAlerts(buildingId: number): void {
    if (this.activeBuildingId === buildingId && this.active) {
      return;
    }

    this.disconnect();
    this.activeBuildingId = buildingId;
    this.active = true;
    void this.openStream(buildingId);
  }

  disconnect(): void {
    this.active = false;
    this.abortController?.abort();
    this.abortController = null;

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    this.activeBuildingId = null;
  }

  private async openStream(buildingId: number): Promise<void> {
    try {
      const token = await this.authService.getToken();
      if (!this.active || this.activeBuildingId !== buildingId) {
        return;
      }

      this.abortController = new AbortController();
      const response = await fetch(`${this.sseBaseUrl}/${buildingId}/events/stream`, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`
        },
        signal: this.abortController.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE connection failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (this.active) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          this.handleSseChunk(part);
        }
      }
    } catch (error) {
      if (this.active) {
        console.error('[BuildingRealtimeService] SSE error:', error);
      }
    } finally {
      if (this.active && this.activeBuildingId === buildingId) {
        this.reconnectTimeoutId = setTimeout(() => void this.openStream(buildingId), 3000);
      }
    }
  }

  private handleSseChunk(chunk: string): void {
    const lines = chunk.split('\n');
    let eventName = 'message';
    const dataLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (dataLines.length === 0) {
      return;
    }

    try {
      const payload = JSON.parse(dataLines.join('\n')) as {
        type?: string;
        buildingId?: number;
        occurredAt?: string;
        payload?: Record<string, unknown>;
      };

      const normalized: BuildingAlertEvent = {
        type: payload.type ?? eventName,
        buildingId: payload.buildingId ?? this.activeBuildingId ?? 0,
        occurredAt: payload.occurredAt ?? new Date().toISOString(),
        ...(payload.payload ?? {})
      };

      this.eventsSubject.next(normalized);
    } catch (error) {
      console.error('[BuildingRealtimeService] Failed to parse alert payload:', error);
    }
  }
}

