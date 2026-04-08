import { Injectable, inject, signal } from '@angular/core';
import { I18nService } from './i18n.service';
import { NotificationCenterService } from './notification-center.service';

@Injectable({
  providedIn: 'root'
})
export class SessionNotificationService {
  private readonly i18n = inject(I18nService);
  private readonly notificationCenter = inject(NotificationCenterService);

  readonly messageKey = signal<string>('');
  readonly visible = signal<boolean>(false);

  constructor() {
    this.i18n.init();
  }

  notifySessionExpired(): void {
    this.show('session.expired.redirecting');
  }

  show(messageKey: string): void {
    this.messageKey.set(messageKey);
    this.visible.set(true);
    this.notificationCenter.upsert({
      source: 'session',
      title: this.i18n.translate('notification.title'),
      message: this.i18n.translate(messageKey),
      severity: 'warning'
    });
  }

  clear(): void {
    this.visible.set(false);
    this.messageKey.set('');
    this.notificationCenter.clearBySource('session');
  }
}
