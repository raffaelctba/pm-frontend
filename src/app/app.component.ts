import { Component, HostListener, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { I18nService } from './services/i18n.service';
import { NotificationCenterService } from './services/notification-center.service';
import { DashboardContextService } from './services/dashboard-context.service';
import { PropertyService } from './services/property.service';
import { SessionToastComponent } from './components/session-toast/session-toast.component';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu.component';
import { canManageBuildingOperations, isMultiUnitProperty } from './shared/utils/property-permissions.util';

interface PropertySubmenuEntry {
  labelKey: string;
  link: any[];
  queryParams?: Record<string, string | number>;
  exact?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SessionToastComponent, ProfileMenuComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="shrink-0 flex items-center">
                <a routerLink="/" class="text-2xl font-bold text-primary-600">MyProperty</a>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a *ngIf="!authService.isLoggedIn()" routerLink="/" routerLinkActive="border-primary-500 text-gray-900"
                   [routerLinkActiveOptions]="{ exact: true }"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {{ i18n.translate('nav.home') }}
                </a>
                <ng-container *ngIf="authService.isLoggedIn()">
                <a routerLink="/portfolio" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {{ i18n.translate('nav.dashboard') }}
                </a>
                <a routerLink="/properties" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {{ i18n.translate('nav.properties') }}
                </a>
                <a routerLink="/invoices" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {{ i18n.translate('nav.invoices') }}
                </a>
                <a routerLink="/chat" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {{ i18n.translate('nav.chat') }}
                </a>
                </ng-container>
              </div>
            </div>
            <div class="flex items-center gap-3" *ngIf="authService.isLoggedIn(); else guestActions">
              <div class="relative">
                <button
                  type="button"
                  class="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
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

                <div *ngIf="notificationPanelOpen()" class="absolute right-0 top-12 z-50 w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('notification.title') }}</h3>
                    <button type="button" class="text-xs text-primary-700 hover:text-primary-800" (click)="clearNotifications()">
                      {{ i18n.translate('notification.clearAll') }}
                    </button>
                  </div>

                  <div class="mt-3 max-h-80 space-y-3 overflow-auto">
                    <div *ngIf="notificationCenter.items().length === 0" class="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                      {{ i18n.translate('notification.empty') }}
                    </div>

                    <div *ngFor="let notification of notificationCenter.items(); trackBy: trackByNotificationId" class="rounded-lg border px-3 py-2" [ngClass]="notificationBorderClass(notification.severity)">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-medium text-slate-900">{{ notification.title }}</p>
                          <p class="text-xs text-slate-600">{{ notification.message }}</p>
                          <p class="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{{ notification.source }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <button type="button" class="text-xs text-slate-500 hover:text-slate-700" (click)="markAsRead(notification.id)">
                            {{ notification.read ? '✓' : i18n.translate('notification.markRead') }}
                          </button>
                          <button type="button" class="text-slate-400 hover:text-slate-600" (click)="dismissNotification(notification.id)">×</button>
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

          <div *ngIf="authService.isLoggedIn() && currentPropertyId() as propertyId" class="border-t border-slate-100 py-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {{ i18n.translate(dashboardContext.workspaceManagementLabelKey()) }}
              </span>

              <a
                *ngFor="let entry of propertySubmenuEntries(propertyId); trackBy: trackBySubmenuLabel"
                [routerLink]="entry.link"
                [queryParams]="entry.queryParams ?? null"
                routerLinkActive="bg-primary-100 text-primary-700"
                [routerLinkActiveOptions]="{ exact: entry.exact ?? false }"
                class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                {{ i18n.translate(entry.labelKey) }}
              </a>
            </div>
          </div>
        </div>
      </nav>

      <app-session-toast />

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  readonly notificationPanelOpen = signal(false);
  readonly currentPropertyId = signal<number | null>(null);
  private readonly buildingSubmenuTemplate: Omit<PropertySubmenuEntry, 'link'>[] = [
    { labelKey: 'property.workspace.overview', exact: true },
    { labelKey: 'property.workspace.units' },
    { labelKey: 'property.workspace.finances' },
    { labelKey: 'property.workspace.incidents' },
    { labelKey: 'property.workspace.workOrders' },
    { labelKey: 'property.workspace.compliance' },
    { labelKey: 'property.workspace.documents' }
  ];
  private readonly privateSubmenuTemplate: Omit<PropertySubmenuEntry, 'link'>[] = [
    { labelKey: 'property.workspace.overview', exact: true },
    { labelKey: 'property.workspace.tenantContracts' },
    { labelKey: 'property.workspace.editProperty' },
    { labelKey: 'nav.invoices' },
    { labelKey: 'nav.chat' }
  ];
  private propertyMetadataLoadId: number | null = null;

  constructor(
    private readonly router: Router,
    public authService: AuthService,
    public notificationCenter: NotificationCenterService,
    public i18n: I18nService,
    public dashboardContext: DashboardContextService,
    private readonly propertyService: PropertyService
  ) {
    this.i18n.init();
    this.syncPropertyRouteContext();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncPropertyRouteContext());
  }

  private syncPropertyRouteContext(): void {
    const match = this.router.url.match(/^\/property\/(\d+)(?:\/|$)/);
    const propertyId = match ? Number(match[1]) : NaN;
    const validPropertyId = Number.isFinite(propertyId) && propertyId > 0 ? propertyId : null;
    this.currentPropertyId.set(validPropertyId);

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

  propertySubmenuEntries(propertyId: number): PropertySubmenuEntry[] {
    const propertyType = this.dashboardContext.property()?.propertyType;
    const currentUserRole = this.dashboardContext.property()?.currentUserRole;
    const multiUnit = isMultiUnitProperty(propertyType);

    if (multiUnit) {
      if (!canManageBuildingOperations(currentUserRole)) {
        return [
          { ...this.buildingSubmenuTemplate[0], link: ['/property', propertyId] },
          { ...this.buildingSubmenuTemplate[3], link: ['/property', propertyId, 'incidents'] },
          { ...this.buildingSubmenuTemplate[6], link: ['/property', propertyId, 'documents'] }
        ];
      }

      return [
        { ...this.buildingSubmenuTemplate[0], link: ['/property', propertyId] },
        { ...this.buildingSubmenuTemplate[1], link: ['/property', propertyId, 'units'] },
        { ...this.buildingSubmenuTemplate[2], link: ['/property', propertyId, 'finances'] },
        { ...this.buildingSubmenuTemplate[3], link: ['/property', propertyId, 'incidents'] },
        { ...this.buildingSubmenuTemplate[4], link: ['/property', propertyId, 'work-orders'] },
        { ...this.buildingSubmenuTemplate[5], link: ['/property', propertyId, 'compliance'] },
        { ...this.buildingSubmenuTemplate[6], link: ['/property', propertyId, 'documents'] }
      ];
    }

    if (propertyType) {
      return [
        { ...this.privateSubmenuTemplate[0], link: ['/property', propertyId] },
        { ...this.privateSubmenuTemplate[1], link: ['/property', propertyId, 'workspace'] },
        { ...this.privateSubmenuTemplate[2], link: ['/properties', propertyId, 'edit'] },
        { ...this.privateSubmenuTemplate[3], link: ['/invoices'], queryParams: { property: propertyId }, exact: true },
        { ...this.privateSubmenuTemplate[4], link: ['/chat'], queryParams: { property: propertyId }, exact: true }
      ];
    }

    return [{ labelKey: 'property.workspace.overview', link: ['/property', propertyId], exact: true }];
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

  trackBySubmenuLabel(_: number, entry: PropertySubmenuEntry): string {
    return entry.labelKey;
  }

  notificationBorderClass(severity: string): string {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'success':
        return 'border-emerald-200 bg-emerald-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  }
}
