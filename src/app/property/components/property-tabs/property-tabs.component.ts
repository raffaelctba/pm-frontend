import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { PropertyDashboardVm } from '../../../shared/models/property-dashboard.model';
import { I18nService } from '../../../services/i18n.service';
import { DashboardContextService } from '../../../services/dashboard-context.service';
import { PropertyImageService } from '../../../services/property-image.service';
import { PropertyImage } from '../../../models/property-image.model';
import { isMultiUnitProperty } from '../../../shared/utils/property-permissions.util';
import { getPropertyRoleLabelKey } from '../../../shared/utils/property-role-i18n.util';

@Component({
  selector: 'app-property-tabs',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap gap-2">
        <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{{ i18n.translate('property.tabs.nav.overview') }}</span>
        <a *ngIf="showUnitsTab()" [routerLink]="['/property', propertyId, 'units']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.units') }}</a>
        <a [routerLink]="['/property', propertyId, 'leases']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.leases') }}</a>
        <a [routerLink]="['/property', propertyId, 'finances']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.financials') }}</a>
        <a [routerLink]="['/property', propertyId, 'billing']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.billing') }}</a>
        <a [routerLink]="['/property', propertyId, 'work-orders']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.maintenance') }}</a>
        <a [routerLink]="['/property', propertyId, 'documents']" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">{{ i18n.translate('property.tabs.nav.documents') }}</a>
      </div>

      <div *ngIf="dashboard as vm" class="space-y-4">
        <!-- Current User Roles Section -->
        <div class="rounded-xl border border-slate-200 bg-blue-50 p-4">
          <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.tabs.userRoles.title') }}</h3>
          <div class="mt-3 flex flex-wrap gap-2">
            @if (getUserRoles().length > 0) {
              @for (role of getUserRoles(); track role) {
                <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  <span class="mr-1">•</span> {{ i18n.translate(getPropertyRoleLabelKey(role)) }}
                </span>
              }
            } @else {
              <span class="text-xs text-slate-600">{{ i18n.translate('property.tabs.userRoles.noRoles') }}</span>
            }
          </div>

          <h4 class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-700">{{ i18n.translate('property.tabs.permissions.title') }}</h4>
          <div class="mt-2 flex flex-wrap gap-2">
            @if (getUserPermissionKeys().length > 0) {
              @for (permissionKey of getUserPermissionKeys(); track permissionKey) {
                <span class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  {{ i18n.translate(permissionKey) }}
                </span>
              }
            } @else {
              <span class="text-xs text-slate-600">{{ i18n.translate('property.tabs.permissions.noPermissions') }}</span>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.unitsTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.totalUnits }}</p>
            <p class="text-sm text-slate-600">{{ vm.overview.occupiedUnits }} {{ i18n.translate('property.tabs.summary.occupied') }} / {{ vm.overview.vacantUnits }} {{ i18n.translate('property.tabs.summary.vacant') }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.invoicesTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.totalInvoices }}</p>
            <p class="text-sm text-slate-600">{{ vm.overview.pendingInvoices }} {{ i18n.translate('property.tabs.summary.pending') }} / {{ vm.overview.overdueInvoices }} {{ i18n.translate('property.tabs.summary.overdue') }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.documentsTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.documentsCount }}</p>
            <p class="text-sm text-slate-600">{{ i18n.translate('property.tabs.summary.storedRecords') }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ i18n.translate('property.tabs.summary.openIssuesTitle') }}</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ vm.overview.incidentsOpen + vm.overview.workOrdersOpen + vm.overview.compliancePending }}</p>
            <p class="text-sm text-slate-600">{{ i18n.translate('property.tabs.summary.openIssuesDetail') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section class="rounded-xl border border-slate-200 p-4">
            <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.tabs.financialSnapshot.title') }}</h3>
            <div class="mt-2 space-y-1 text-sm text-slate-600">
              <p>{{ i18n.translate('property.tabs.financialSnapshot.pendingAmount') }}: {{ vm.overview.pendingAmount | currency }}</p>
              <p>{{ i18n.translate('property.tabs.financialSnapshot.paidAmount') }}: {{ vm.overview.paidAmount | currency }}</p>
              <p>{{ i18n.translate('property.tabs.financialSnapshot.overdueAmount') }}: {{ vm.overview.overdueAmount | currency }}</p>
            </div>
          </section>
          <section class="rounded-xl border border-slate-200 p-4">
            <h3 class="text-sm font-semibold text-slate-900">{{ i18n.translate('property.tabs.recentActivity.title') }}</h3>
            <div class="mt-2 space-y-2 text-sm text-slate-600">
              @if (vm.recentActivity.length === 0) {
                <p>{{ i18n.translate('property.tabs.recentActivity.empty') }}</p>
              } @else {
                @for (item of vm.recentActivity; track item.type + item.timestamp + item.title) {
                  <div class="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p class="font-medium text-slate-900">{{ item.title }}</p>
                      <p class="text-xs uppercase tracking-wide text-slate-500">{{ getActivityTypeLabel(item.type) }} · {{ getActivityStatusLabel(item.status) }}</p>
                    </div>
                    <span class="text-xs text-slate-500">{{ item.timestamp | date:'short' }}</span>
                  </div>
                }
              }
            </div>
          </section>
        </div>

        <section class="rounded-xl border border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-900">Galeria do imovel</h3>
            <span class="text-xs text-slate-500">{{ propertyImages().length }} fotos</span>
          </div>

          @if (imageError()) {
            <div class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ imageError() }}</div>
          }

          @if (imageSuccess()) {
            <div class="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">{{ imageSuccess() }}</div>
          }

          @if (canManageGallery()) {
            <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div class="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
                <input type="file" accept="image/*" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" (change)="onFileSelected($event)" />
                <button type="button" class="btn btn-secondary text-xs" [disabled]="!selectedFile() || uploadInProgress()" (click)="uploadSelectedFile(false)">
                  {{ uploadInProgress() ? 'Enviando...' : 'Enviar' }}
                </button>
                <button type="button" class="btn btn-primary text-xs" [disabled]="!selectedFile() || uploadInProgress()" (click)="uploadSelectedFile(true)">
                  Enviar + principal
                </button>
              </div>
              @if (selectedFileName()) {
                <p class="mt-2 text-xs text-slate-600">Arquivo selecionado: {{ selectedFileName() }}</p>
              }
            </div>
          } @else {
            <p class="mb-3 text-xs text-slate-500">Somente usuarios com acesso administrativo podem gerenciar fotos.</p>
          }

          @if (loadingImages()) {
            <p class="text-xs text-slate-500">Carregando fotos...</p>
          } @else if (propertyImages().length === 0) {
            <p class="text-xs text-slate-500">Nenhuma foto cadastrada para este imovel.</p>
          } @else {
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              @for (image of propertyImages(); track image.id) {
                <figure class="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div class="relative">
                    <img class="h-28 w-full object-cover" [src]="imageUrl(image)" [alt]="image.description || 'Foto do imovel'" loading="lazy" />
                    @if (image.isPrimary) {
                      <span class="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">Principal</span>
                    }
                  </div>
                  @if (canManageGallery()) {
                    <figcaption class="flex gap-1 p-2">
                      <button
                        type="button"
                        class="btn btn-secondary flex-1 text-[11px]"
                        [disabled]="image.isPrimary || updatingImageId() === image.id"
                        (click)="setPrimaryImage(image.id)">
                        Principal
                      </button>
                      <button
                        type="button"
                        class="btn btn-danger flex-1 text-[11px]"
                        [disabled]="updatingImageId() === image.id"
                        (click)="deleteImage(image.id)">
                        Excluir
                      </button>
                    </figcaption>
                  }
                </figure>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `
})
export class PropertyTabsComponent implements OnChanges {
  readonly i18n = inject(I18nService);
  private readonly propertyImageService = inject(PropertyImageService);
  private readonly dashboardContext = inject(DashboardContextService);

  readonly propertyImages = signal<PropertyImage[]>([]);
  readonly loadingImages = signal<boolean>(false);
  readonly uploadInProgress = signal<boolean>(false);
  readonly imageError = signal<string>('');
  readonly imageSuccess = signal<string>('');
  readonly selectedFile = signal<File | null>(null);
  readonly selectedFileName = signal<string>('');
  readonly updatingImageId = signal<number | null>(null);

  @Input() propertyId: number | null = null;
  @Input() dashboard: PropertyDashboardVm | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ('propertyId' in changes) {
      this.loadImages();
    }
  }

  loadImages(): void {
    if (!this.propertyId) {
      this.propertyImages.set([]);
      return;
    }

    this.loadingImages.set(true);
    this.propertyImageService.getPropertyImages(this.propertyId).subscribe({
      next: (images) => {
        this.propertyImages.set((images ?? []).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
        this.loadingImages.set(false);
      },
      error: () => {
        this.imageError.set('Nao foi possivel carregar as fotos do imovel.');
        this.loadingImages.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.selectedFileName.set(file?.name ?? '');
    this.imageError.set('');
    this.imageSuccess.set('');
  }

  uploadSelectedFile(markAsPrimary: boolean): void {
    if (!this.propertyId || !this.selectedFile()) {
      return;
    }

    this.uploadInProgress.set(true);
    this.imageError.set('');
    this.imageSuccess.set('');

    this.propertyImageService.uploadImage(this.propertyId, this.selectedFile()!, undefined, markAsPrimary).subscribe({
      next: () => {
        this.uploadInProgress.set(false);
        this.selectedFile.set(null);
        this.selectedFileName.set('');
        this.imageSuccess.set('Foto enviada com sucesso.');
        this.loadImages();
      },
      error: () => {
        this.uploadInProgress.set(false);
        this.imageError.set('Nao foi possivel enviar a foto.');
      }
    });
  }

  setPrimaryImage(imageId: number): void {
    if (!this.propertyId) {
      return;
    }

    this.updatingImageId.set(imageId);
    this.imageError.set('');
    this.propertyImageService.setPrimaryImage(this.propertyId, imageId).subscribe({
      next: () => {
        this.updatingImageId.set(null);
        this.imageSuccess.set('Foto principal atualizada.');
        this.loadImages();
      },
      error: () => {
        this.updatingImageId.set(null);
        this.imageError.set('Nao foi possivel definir a foto principal.');
      }
    });
  }

  deleteImage(imageId: number): void {
    if (!this.propertyId) {
      return;
    }

    this.updatingImageId.set(imageId);
    this.imageError.set('');
    this.propertyImageService.deleteImage(this.propertyId, imageId).subscribe({
      next: () => {
        this.updatingImageId.set(null);
        this.imageSuccess.set('Foto removida com sucesso.');
        this.loadImages();
      },
      error: () => {
        this.updatingImageId.set(null);
        this.imageError.set('Nao foi possivel remover a foto.');
      }
    });
  }

  canManageGallery(): boolean {
    const role = this.dashboardContext.property()?.currentUserRole;
    return role === 'PROPERTY_ADMIN' || role === 'PROPERTY_OWNER';
  }

  imageUrl(image: PropertyImage): string {
    return this.propertyImageService.getImageUrl(image.imageUrl);
  }

  getActivityTypeLabel(type: string): string {
    const key = `portfolio.maintenance.activity.type.${this.normalizeValue(type)}`;
    const translated = this.i18n.translate(key);
    return translated === key ? type : translated;
  }

  getActivityStatusLabel(status: string): string {
    const key = `portfolio.maintenance.activity.status.${this.normalizeValue(status)}`;
    const translated = this.i18n.translate(key);
    return translated === key ? status : translated;
  }

  private normalizeValue(value: string): string {
    return value?.toLowerCase().trim().replace(/[_\s]+/g, '-') || '';
  }

  showUnitsTab(): boolean {
    return isMultiUnitProperty(this.dashboardContext.property()?.propertyType);
  }

  getUserRoles(): string[] {
    if (!this.dashboard?.header?.userRolesLabel) {
      return [];
    }
    return this.dashboard.header.userRolesLabel
      .split(', ')
      .filter(role => role && role !== 'No role');
  }

  getPropertyRoleLabelKey(role: string): string {
    return getPropertyRoleLabelKey(role);
  }

  getUserPermissionKeys(): string[] {
    const permissions = this.dashboard?.header?.userPermissions ?? [];
    return Array.from(new Set(permissions.filter((permission) => !!permission)));
  }
}



