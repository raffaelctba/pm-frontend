import { Injectable, computed, signal } from '@angular/core';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  source: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  createdAt: string;
  read: boolean;
}

export interface NotificationUpsert {
  source: string;
  title: string;
  message: string;
  severity?: NotificationSeverity;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationCenterService {
  private readonly itemsState = signal<NotificationItem[]>([]);

  readonly items = computed(() => this.itemsState().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  readonly unreadCount = computed(() => this.items().filter((item) => !item.read).length);
  readonly hasNotifications = computed(() => this.items().length > 0);

  upsert(notification: NotificationUpsert): void {
    const nextItem: NotificationItem = {
      id: notification.source,
      source: notification.source,
      title: notification.title,
      message: notification.message,
      severity: notification.severity ?? 'info',
      createdAt: new Date().toISOString(),
      read: false
    };

    this.itemsState.update((items) => {
      const index = items.findIndex((item) => item.source === notification.source);
      if (index === -1) {
        return [...items, nextItem];
      }

      const updated = [...items];
      updated[index] = { ...updated[index], ...nextItem };
      return updated;
    });
  }

  markAsRead(id: string): void {
    this.itemsState.update((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  dismiss(id: string): void {
    this.itemsState.update((items) => items.filter((item) => item.id !== id));
  }

  clearBySource(source: string): void {
    this.itemsState.update((items) => items.filter((item) => item.source !== source));
  }

  clearAll(): void {
    this.itemsState.set([]);
  }
}

