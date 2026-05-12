import { Component, HostListener, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { TranslationService } from './services/translation.service';
import { NotificationCenterService } from './services/notification-center.service';
import { DashboardContextService } from './services/dashboard-context.service';
import { PropertyService } from './services/property.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { SessionToastComponent } from './components/session-toast/session-toast.component';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu.component';
import { BreadcrumbComponent } from './navigation/components/breadcrumb/breadcrumb.component';
import { TopMenuComponent } from './navigation/components/top-menu/top-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SessionToastComponent, ProfileMenuComponent, BreadcrumbComponent, TopMenuComponent],
  template: `
    <div class="min-h-screen bg-gray-50 transition-colors dark:bg-slate-950">
      <nav class="bg-white shadow-lg transition-colors dark:bg-slate-900 dark:shadow-black/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="shrink-0 flex items-center">
                <a routerLink="/" class="text-2xl font-bold text-primary-600">MyProperty</a>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a *ngIf="!authService.isLoggedIn()" routerLink="/" routerLinkActive="border-primary-500 text-gray-900 dark:text-slate-100"
                   [routerLinkActiveOptions]="{ exact: true }"
                   class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200">
                  {{ i18n.translate('nav.home') }}
                </a>
                <ng-container *ngIf="authService.isLoggedIn()">
                <a routerLink="/portfolio" routerLinkActive="border-primary-500 text-gray-900 dark:text-slate-100"
                   class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200">
                  {{ i18n.translate('nav.dashboard') }}
                </a>
                <a routerLink="/invoices" routerLinkActive="border-primary-500 text-gray-900 dark:text-slate-100"
                   class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200">
                  {{ i18n.translate('nav.invoices') }}
                </a>
                <a routerLink="/chat" routerLinkActive="border-primary-500 text-gray-900 dark:text-slate-100"
                   class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200">
                  {{ i18n.translate('nav.chat') }}
                </a>
                </ng-container>
              </div>
            </div>
            <div class="flex items-center gap-3" *ngIf="authService.isLoggedIn(); else guestActions">
              <div class="relative">
                <button
                  type="button"
                  class="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  [attr.aria-label]="i18n.translate('notification.title')"
                  (click)="toggleNotifications($event)"
                >
                  <span class="sr-only">{{ i18n.translate('notification.title') }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                    <path d="M12 2a6 6 0 0 0-6 6v3.17c0 .53-.21 1.04-.59 1.41L4 14v1h16v-1l-1.41-1.42A1.99 1.99 0 0 1 18 12.17V8a6 6 0 0 0-6-6Zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z"/>
                  </svg>
                  <span *ngIf="notificationCenter.unreadCount() > 0" class="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {{ notificationCenter.unreadCount() }}
                  </span>
                </button>

                <div *ngIf="notificationPanelOpen()" class="absolute right-0 top-12 z-50 w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50">
                  <div class="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ i18n.translate('notification.title') }}</h3>
                    <button type="button" class="text-xs text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200" (click)="clearNotifications()">
                      {{ i18n.translate('notification.clearAll') }}
                    </button>
                  </div>

                  <div class="mt-3 max-h-80 space-y-3 overflow-auto">
                    <div *ngIf="notificationCenter.items().length === 0" class="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      {{ i18n.translate('notification.empty') }}
                    </div>

                    <div *ngFor="let notification of notificationCenter.items(); trackBy: trackByNotificationId" class="rounded-lg border px-3 py-2" [ngClass]="notificationBorderClass(notification.severity)">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ notification.title }}</p>
                          <p class="text-xs text-slate-600 dark:text-slate-300">{{ notification.message }}</p>
                          <p class="mt-1 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{{ notification.source }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <button type="button" class="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" (click)="markAsRead(notification.id)">
                            {{ notification.read ? '✓' : i18n.translate('notification.markRead') }}
                          </button>
                          <button type="button" class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" (click)="dismissNotification(notification.id)">×</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <app-profile-menu />
            </div>
            <ng-template #guestActions>
              <div class="flex items-center gap-3">
                <button (click)="login()" class="btn btn-secondary">{{ i18n.translate('nav.login') }}</button>
                <a routerLink="/signup" class="btn btn-primary">{{ i18n.translate('nav.signup') }}</a>
              </div>
            </ng-template>
          </div>

        </div>
      </nav>

      <app-breadcrumb />
      <app-top-menu />

      <app-session-toast />

      <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  readonly notificationPanelOpen = signal(false);
  private propertyMetadataLoadId: number | null = null;

  constructor(
    private readonly router: Router,
    public authService: AuthService,
    public notificationCenter: NotificationCenterService,
    public i18n: TranslationService,
    public dashboardContext: DashboardContextService,
    private readonly propertyService: PropertyService,
    private readonly userPreferences: UserPreferencesService
  ) {
    // Force early preferences service initialization so dark mode class is applied globally.
    this.userPreferences.themeMode();
    this.syncPropertyRouteContext();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncPropertyRouteContext());
  }

  private syncPropertyRouteContext(): void {
    const match = this.router.url.match(/^\/(?:property|building)\/(\d+)(?:\/|$)/);
    const propertyId = match ? Number(match[1]) : NaN;
    const validPropertyId = Number.isFinite(propertyId) && propertyId > 0 ? propertyId : null;

    if (validPropertyId !== null) {
      this.dashboardContext.setPropertyContext(validPropertyId);
      this.ensurePropertyMetadata(validPropertyId);
    }
  }

  private ensurePropertyMetadata(propertyId: number): void {
    if (this.dashboardContext.property()?.id === propertyId || this.propertyMetadataLoadId === propertyId) {
      return;
    }

    this.propertyMetadataLoadId = propertyId;
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (property) => {
        this.dashboardContext.setProperty(property);
      },
      error: () => {
        // Keep the submenu visible with default label when metadata lookup fails.
        if (this.propertyMetadataLoadId === propertyId) {
          this.propertyMetadataLoadId = null;
        }
      },
      complete: () => {
        if (this.propertyMetadataLoadId === propertyId) {
          this.propertyMetadataLoadId = null;
        }
      }
    });
  }

  @HostListener('document:click')
  closeNotificationPanel(): void {
    this.notificationPanelOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  login(): void {
    this.authService.login();
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationPanelOpen.update((open) => !open);
  }

  clearNotifications(): void {
    this.notificationCenter.clearAll();
  }

  markAsRead(id: string): void {
    this.notificationCenter.markAsRead(id);
  }

  dismissNotification(id: string): void {
    this.notificationCenter.dismiss(id);
  }

  trackByNotificationId(_: number, item: { id: string }): string {
    return item.id;
  }

  notificationBorderClass(severity: string): string {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-900/80 dark:bg-red-950/40';
      case 'warning':
        return 'border-amber-200 bg-amber-50 dark:border-amber-900/80 dark:bg-amber-950/40';
      case 'success':
        return 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/80 dark:bg-emerald-950/40';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60';
    }
  }
}

