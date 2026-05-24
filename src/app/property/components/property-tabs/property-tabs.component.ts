import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { PropertyDashboardVm } from '../../../shared/models/property-dashboard.model';
import { I18nService } from '../../../services/i18n.service';
import { DashboardContextService } from '../../../services/dashboard-context.service';
import { PropertyImageService } from '../../../services/property-image.service';
import { PropertyImage } from '../../../models/property-image.model';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';
import { getPropertyRoleLabelKey } from '../../../shared/utils/property-role-i18n.util';

@Component({
  selector: 'app-property-tabs',
  standalone: false,
  template: `
    <div class="space-y-6">
      <div *ngIf="dashboard as vm" class="space-y-6">
        <!-- Dashboard Summary Overview -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <span class="material-symbols-outlined">domain</span>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ i18n.translate('property.tabs.summary.unitsTitle') }}</p>
                <p class="mt-0.5 text-xl font-bold text-slate-900">{{ vm.overview.totalUnits }}</p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
              <span class="text-slate-600">{{ vm.overview.occupiedUnits }} {{ i18n.translate('property.tabs.summary.occupied') }}</span>
              <span class="h-1 w-1 rounded-full bg-slate-300"></span>
              <span class="text-slate-600">{{ vm.overview.vacantUnits }} {{ i18n.translate('property.tabs.summary.vacant') }}</span>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <span class="material-symbols-outlined">receipt_long</span>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ i18n.translate('property.tabs.summary.invoicesTitle') }}</p>
                <p class="mt-0.5 text-xl font-bold text-slate-900">{{ vm.overview.totalInvoices }}</p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
              <span class="text-slate-600">{{ vm.overview.pendingInvoices }} {{ i18n.translate('property.tabs.summary.pending') }}</span>
              <span class="h-1 w-1 rounded-full bg-slate-300"></span>
              <span class="text-amber-600 font-medium">{{ vm.overview.overdueInvoices }} {{ i18n.translate('property.tabs.summary.overdue') }}</span>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <span class="material-symbols-outlined">description</span>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ i18n.translate('property.tabs.summary.documentsTitle') }}</p>
                <p class="mt-0.5 text-xl font-bold text-slate-900">{{ vm.overview.documentsCount }}</p>
              </div>
            </div>
            <div class="mt-4 border-t border-slate-50 pt-3 text-xs">
              <span class="text-slate-600">{{ i18n.translate('property.tabs.summary.storedRecords') }}</span>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <span class="material-symbols-outlined">report_problem</span>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ i18n.translate('property.tabs.summary.openIssuesTitle') }}</p>
                <p class="mt-0.5 text-xl font-bold text-slate-900">{{ vm.overview.incidentsOpen + vm.overview.workOrdersOpen + vm.overview.compliancePending }}</p>
              </div>
            </div>
            <div class="mt-4 border-t border-slate-50 pt-3 text-xs">
              <span class="text-slate-600">{{ i18n.translate('property.tabs.summary.openIssuesDetail') }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Recent Activity -->
          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900">{{ i18n.translate('property.tabs.recentActivity.title') }}</h3>
              <span class="material-symbols-outlined text-slate-400">history</span>
            </div>
            <div class="space-y-3">
              @if (vm.recentActivity.length === 0) {
                <div class="flex flex-col items-center justify-center py-8 text-center">
                  <span class="material-symbols-outlined text-4xl text-slate-200">notifications_off</span>
                  <p class="mt-2 text-sm text-slate-500">{{ i18n.translate('property.tabs.recentActivity.empty') }}</p>
                </div>
              } @else {
                @for (item of vm.recentActivity; track item.type + item.timestamp + item.title) {
                  <div class="flex items-start gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                      <span class="material-symbols-outlined text-lg">
                        {{ item.type === 'incident' ? 'emergency_home' : item.type === 'work-order' ? 'build' : item.type === 'compliance' ? 'verified' : 'description' }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <p class="truncate font-semibold text-slate-900">{{ item.title }}</p>
                        <span class="shrink-0 text-[10px] font-medium text-slate-400">{{ item.timestamp | date:'shortTime' }}</span>
                      </div>
                      <div class="mt-0.5 flex items-center gap-2">
                        <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{{ getActivityTypeLabel(item.type) }}</span>
                        <span class="h-1 w-1 rounded-full bg-slate-300"></span>
                        <span class="text-[10px] text-slate-500">{{ getActivityStatusLabel(item.status) }}</span>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </section>

          <!-- Financial Snapshot -->
          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900">{{ i18n.translate('property.tabs.financialSnapshot.title') }}</h3>
              <span class="material-symbols-outlined text-slate-400">account_balance_wallet</span>
            </div>
            <div class="space-y-4">
              <div class="rounded-xl bg-slate-900 p-5 text-white shadow-lg">
                <p class="text-xs font-medium uppercase tracking-widest text-slate-400">{{ i18n.translate('property.tabs.financialSnapshot.pendingAmount') }}</p>
                <p class="mt-1 text-3xl font-bold">{{ vm.overview.pendingAmount | currency }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ i18n.translate('property.tabs.financialSnapshot.paidAmount') }}</p>
                  <p class="mt-1 text-lg font-bold text-emerald-600">{{ vm.overview.paidAmount | currency }}</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ i18n.translate('property.tabs.financialSnapshot.overdueAmount') }}</p>
                  <p class="mt-1 text-lg font-bold text-rose-600">{{ vm.overview.overdueAmount | currency }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Property Gallery -->
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">{{ i18n.translate('property.tabs.gallery.title') }}</h3>
              <p class="text-xs text-slate-500">{{ propertyImages().length }} {{ i18n.translate('property.tabs.gallery.photosCount') }}</p>
            </div>
            <span class="material-symbols-outlined text-slate-400">photo_library</span>
          </div>

          @if (imageError()) {
            <div class="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span class="material-symbols-outlined text-lg">error</span>
              {{ imageError() }}
            </div>
          }

          @if (imageSuccess()) {
            <div class="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span class="material-symbols-outlined text-lg">check_circle</span>
              {{ imageSuccess() }}
            </div>
          }

          @if (canManageGallery()) {
            <div class="mb-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
              <div class="flex flex-col items-center justify-center gap-4 md:flex-row">
                <div class="relative flex-1 w-full max-w-md">
                  <input type="file" accept="image/*" class="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" (change)="onFileSelected($event)" />
                  <div class="flex h-11 items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-600">
                    <span class="truncate">{{ selectedFileName() || i18n.translate('property.tabs.gallery.selectFile') }}</span>
                    <span class="material-symbols-outlined text-slate-400">upload_file</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="button" class="btn btn-secondary h-11 px-6" [disabled]="!selectedFile() || uploadInProgress()" (click)="uploadSelectedFile(false)">
                    {{ uploadInProgress() ? i18n.translate('property.tabs.gallery.uploading') : i18n.translate('property.tabs.gallery.upload') }}
                  </button>
                  <button type="button" class="btn btn-primary h-11 px-6 flex items-center gap-2" [disabled]="!selectedFile() || uploadInProgress()" (click)="uploadSelectedFile(true)">
                    <span class="material-symbols-outlined text-sm">star</span>
                    {{ i18n.translate('property.tabs.gallery.uploadAsPrimary') }}
                  </button>
                </div>
              </div>
            </div>
          }

          @if (loadingImages()) {
            <div class="flex flex-col items-center justify-center py-12">
               <div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
               <p class="mt-3 text-sm text-slate-500">{{ i18n.translate('property.tabs.gallery.loading') }}</p>
            </div>
          } @else if (propertyImages().length === 0) {
            <div class="flex flex-col items-center justify-center py-12 text-center">
              <span class="material-symbols-outlined text-5xl text-slate-200">no_photography</span>
              <p class="mt-4 text-sm text-slate-500">{{ i18n.translate('property.tabs.gallery.empty') }}</p>
            </div>
          } @else {
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              @for (image of propertyImages(); track image.id) {
                <div class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-blue-400 hover:shadow-lg">
                  <div class="aspect-square w-full">
                    <img class="h-full w-full object-cover" [src]="imageUrl(image)" [alt]="image.description || i18n.translate('property.tabs.gallery.title')" loading="lazy" />
                  </div>
                  
                  @if (image.isPrimary) {
                    <div class="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                      <span class="material-symbols-outlined text-xs">star</span>
                      {{ i18n.translate('property.tabs.gallery.primary') }}
                    </div>
                  }

                  @if (canManageGallery()) {
                    <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        class="w-32 rounded-lg bg-white py-2 text-xs font-bold text-slate-900 shadow-sm transition-transform active:scale-95"
                        [disabled]="image.isPrimary || updatingImageId() === image.id"
                        (click)="setPrimaryImage(image.id)">
                        {{ i18n.translate('property.tabs.gallery.setPrimary') }}
                      </button>
                      <button
                        type="button"
                        class="w-32 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                        [disabled]="updatingImageId() === image.id"
                        (click)="deleteImage(image.id)">
                        {{ i18n.translate('property.tabs.gallery.delete') }}
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </section>

        <!-- Access & Roles Information -->
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
           <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900">{{ i18n.translate('property.tabs.userRoles.title') }}</h3>
              <span class="material-symbols-outlined text-slate-400">admin_panel_settings</span>
           </div>
           
           <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div>
               <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ i18n.translate('property.role.label') }}</h4>
               <div class="mt-3 flex flex-wrap gap-2">
                 @if (getUserRoles().length > 0) {
                   @for (role of getUserRoles(); track role) {
                     <span class="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                       <span class="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                       {{ i18n.translate(getPropertyRoleLabelKey(role)) }}
                     </span>
                   }
                 } @else {
                   <p class="text-sm text-slate-500">{{ i18n.translate('property.tabs.userRoles.noRoles') }}</p>
                 }
               </div>
             </div>

             <div>
               <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ i18n.translate('property.tabs.permissions.title') }}</h4>
               <div class="mt-3 flex flex-wrap gap-2">
                 @if (getUserPermissionKeys().length > 0) {
                   @for (permissionKey of getUserPermissionKeys(); track permissionKey) {
                     <span class="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                       {{ i18n.translate(permissionKey) }}
                     </span>
                   }
                 } @else {
                   <p class="text-sm text-slate-500">{{ i18n.translate('property.tabs.permissions.noPermissions') }}</p>
                 }
               </div>
             </div>
           </div>
           
           <div class="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-100">
             <span class="material-symbols-outlined text-slate-400">info</span>
             <p>{{ i18n.translate('property.header.workspaceActionsHint') }}</p>
           </div>
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
        this.imageError.set(this.i18n.translate('property.tabs.gallery.loadError'));
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
        this.imageSuccess.set(this.i18n.translate('property.tabs.gallery.uploadSuccess'));
        this.loadImages();
      },
      error: () => {
        this.uploadInProgress.set(false);
        this.imageError.set(this.i18n.translate('property.tabs.gallery.uploadError'));
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
        this.imageSuccess.set(this.i18n.translate('property.tabs.gallery.setPrimarySuccess'));
        this.loadImages();
      },
      error: () => {
        this.updatingImageId.set(null);
        this.imageError.set(this.i18n.translate('property.tabs.gallery.setPrimaryError'));
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
        this.imageSuccess.set(this.i18n.translate('property.tabs.gallery.deleteSuccess'));
        this.loadImages();
      },
      error: () => {
        this.updatingImageId.set(null);
        this.imageError.set(this.i18n.translate('property.tabs.gallery.deleteError'));
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

  getUserRoles(): string[] {
    if (!this.dashboard?.header?.userRolesLabel) {
      return [];
    }
    return this.dashboard.header.userRolesLabel
      .split(', ')
      .filter((role: string) => role && role !== 'No role');
  }

  getPropertyRoleLabelKey(role: string): string {
    return getPropertyRoleLabelKey(role);
  }

  getUserPermissionKeys(): string[] {
    const permissions = this.dashboard?.header?.userPermissions ?? [];
    return Array.from(new Set(permissions.filter((permission: string) => !!permission)));
  }
}



