import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AddressService } from '../../../services/address.service';
import { CurrencyService } from '../../../services/currency.service';
import { PropertyImageService } from '../../../services/property-image.service';
import { Property } from '../../../models/property.model';
import { PropertyImage } from '../../../models/property-image.model';
import { isMultiUnitProperty } from '../../../shared/utils/property-permissions.util';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-4 py-6 max-w-6xl mx-auto">
      @if (loading()) {
        <div class="text-center py-8">
          <p class="text-gray-500">Carregando...</p>
        </div>
      }

      @if (!loading() && property(); as currentProperty) {
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">{{ currentProperty.name }}</h1>
          <div class="flex space-x-2">
            <a [routerLink]="['/property', currentProperty.id]" class="btn btn-primary">
              {{ isBuildingProperty(currentProperty) ? 'Abrir painel do prédio' : 'Abrir workspace do imóvel' }}
            </a>
            <a [routerLink]="['/properties', currentProperty.id, 'edit']" class="btn btn-primary">
              Editar
            </a>
            <a routerLink="/properties" class="btn btn-secondary">
              Voltar
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Information -->
          <div class="lg:col-span-2 space-y-6">
            <div class="card overflow-hidden">
              <img
                class="h-80 w-full rounded-xl object-cover bg-slate-100"
                [src]="getPropertyHeroImage(currentProperty)"
                [alt]="currentProperty.name"
                loading="eager"
                (error)="onHeroImageError($event, currentProperty)"
              />
            </div>

            <div class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Informações Gerais</h2>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getPropertyTypeLabel(currentProperty.propertyType) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Status</dt>
                  <dd class="mt-1">
                    <span [ngClass]="{
                      'bg-green-100 text-green-800': currentProperty.status === 'ACTIVE',
                      'bg-gray-100 text-gray-800': currentProperty.status === 'INACTIVE',
                      'bg-yellow-100 text-yellow-800': currentProperty.status === 'MAINTENANCE',
                      'bg-red-100 text-red-800': currentProperty.status === 'SOLD'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getStatusLabel(currentProperty.status) }}
                    </span>
                  </dd>
                </div>
                @if (currentProperty.description) {
                  <div class="md:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Descrição</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ currentProperty.description }}</dd>
                  </div>
                }
              </dl>
            </div>

            @if (currentProperty.address; as address) {
              <div class="card">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Endereço</h2>
                <p class="text-gray-900">
                  {{ address.street }}, {{ address.number }}
                  @if (address.complement) {
                    <span> - {{ address.complement }}</span>
                  }
                </p>
                <p class="text-gray-900">
                  {{ address.neighborhood }}, {{ address.city }} - {{ address.state }}
                </p>
                @if (address.zipCode) {
                  <p class="text-gray-900">{{ address.zipCode }}</p>
                }
                <p class="text-gray-900 mt-2">{{ getCountryName(address.countryCode) }}</p>
              </div>
            }

            <div class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Características</h2>
              <dl class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @if (currentProperty.areaSize) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Área</dt>
                    <dd class="mt-1 text-lg font-semibold text-gray-900">{{ currentProperty.areaSize }}m²</dd>
                  </div>
                }
                @if (currentProperty.bedrooms) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Quartos</dt>
                    <dd class="mt-1 text-lg font-semibold text-gray-900">{{ currentProperty.bedrooms }}</dd>
                  </div>
                }
                @if (currentProperty.bathrooms) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Banheiros</dt>
                    <dd class="mt-1 text-lg font-semibold text-gray-900">{{ currentProperty.bathrooms }}</dd>
                  </div>
                }
                @if (currentProperty.parkingSpaces) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Vagas</dt>
                    <dd class="mt-1 text-lg font-semibold text-gray-900">{{ currentProperty.parkingSpaces }}</dd>
                  </div>
                }
              </dl>
            </div>

            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900">Fotos do imóvel</h2>
                <span class="text-sm text-gray-500">{{ propertyImages().length }} imagens</span>
              </div>

              @if (imageUploadError()) {
                <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {{ imageUploadError() }}
                </div>
              }

              @if (imageUploadSuccess()) {
                <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {{ imageUploadSuccess() }}
                </div>
              }

              <div
                class="mb-6 rounded-2xl border-2 border-dashed p-5 transition"
                [ngClass]="isDragOver() ? 'border-primary-400 bg-primary-50' : 'border-slate-200 bg-slate-50'"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event, currentProperty.id)"
                (click)="uploadInput.click()"
                role="button"
                tabindex="0"
                (keydown.enter)="uploadInput.click()"
                (keydown.space)="$event.preventDefault(); uploadInput.click()"
              >
                <input
                  #uploadInput
                  type="file"
                  accept="image/*"
                  class="hidden"
                  (change)="onFileSelected($event)"
                />

                <div class="flex flex-col items-center justify-center gap-2 text-center">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <span class="text-xl">📷</span>
                  </div>
                  <p class="text-sm font-medium text-gray-900">
                    Arraste e solte uma imagem aqui ou clique para selecionar
                  </p>
                  <p class="text-xs text-gray-500">
                    JPG, PNG, WEBP e outros formatos de imagem são aceitos.
                  </p>
                  @if (selectedFileName()) {
                    <p class="text-xs text-primary-700">
                      Arquivo selecionado: {{ selectedFileName() }}
                    </p>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                @for (image of propertyImages(); track image.id) {
                  <figure class="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                    <div class="relative">
                      <img class="h-40 w-full object-cover" [src]="imageUrl(image, currentProperty.id)" [alt]="image.description || currentProperty.name" loading="lazy" />
                      @if (image.isPrimary) {
                        <span class="absolute left-3 top-3 rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
                          Principal
                        </span>
                      }
                    </div>
                    <figcaption class="space-y-3 px-3 py-3 text-xs text-slate-600">
                      <div class="flex items-start justify-between gap-2">
                        <span class="line-clamp-2 flex-1">{{ image.description || 'Sem descrição' }}</span>
                        <span class="shrink-0 rounded-full bg-slate-200 px-2 py-1 font-medium text-slate-700">
                          {{ image.displayOrder + 1 }}
                        </span>
                      </div>
                      <div class="flex gap-2">
                        <button
                          type="button"
                          class="btn btn-secondary flex-1 text-xs"
                          [disabled]="image.isPrimary || updatingImageId() === image.id"
                          (click)="setPrimaryImage(currentProperty.id, image.id); $event.stopPropagation()"
                        >
                          {{ image.isPrimary ? 'Principal' : 'Definir como principal' }}
                        </button>
                        <button
                          type="button"
                          class="btn btn-danger flex-1 text-xs"
                          [disabled]="updatingImageId() === image.id"
                          (click)="deleteImage(currentProperty.id, image.id); $event.stopPropagation()"
                        >
                          Excluir
                        </button>
                      </div>
                    </figcaption>
                  </figure>
                }
              </div>
            </div>

            @if (isBuildingProperty(currentProperty)) {
              <div class="card">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Informações do Prédio</h2>
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @if (currentProperty.totalUnits) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Total de Unidades</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ currentProperty.totalUnits }}</dd>
                    </div>
                  }
                  @if ((currentProperty.billing?.monthlyFee ?? currentProperty.monthlyFee) !== undefined && (currentProperty.billing?.monthlyFee ?? currentProperty.monthlyFee) !== null) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Taxa Mensal</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ currencyService.formatCurrency(currentProperty.billing?.monthlyFee ?? currentProperty.monthlyFee ?? 0, currentProperty.billing?.currencyCode || currentProperty.currencyCode || 'BRL') }}
                      </dd>
                    </div>
                  }
                  @if ((currentProperty.billing?.dueDay ?? currentProperty.dueDay) !== undefined && (currentProperty.billing?.dueDay ?? currentProperty.dueDay) !== null) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Dia de Vencimento</dt>
                      <dd class="mt-1 text-sm text-gray-900">Dia {{ currentProperty.billing?.dueDay ?? currentProperty.dueDay }}</dd>
                    </div>
                  }
                  @if ((currentProperty.billing?.lateFeePercentage ?? currentProperty.lateFeePercentage) !== undefined && (currentProperty.billing?.lateFeePercentage ?? currentProperty.lateFeePercentage) !== null) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Multa por Atraso</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ currentProperty.billing?.lateFeePercentage ?? currentProperty.lateFeePercentage }}%</dd>
                    </div>
                  }
                  @if ((currentProperty.billing?.interestRateMonthly ?? currentProperty.interestRateMonthly) !== undefined && (currentProperty.billing?.interestRateMonthly ?? currentProperty.interestRateMonthly) !== null) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Juros Mensal</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ currentProperty.billing?.interestRateMonthly ?? currentProperty.interestRateMonthly }}%</dd>
                    </div>
                  }
                </dl>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div class="space-y-2">
                <a [routerLink]="['/invoices']" [queryParams]="{property: currentProperty.id}"
                   class="block w-full btn btn-primary text-center">
                  Ver Faturas
                </a>
                @if (isBuildingProperty(currentProperty)) {
                  <a [routerLink]="['/property', currentProperty.id, 'units']"
                     class="block w-full btn btn-secondary text-center">
                    Gerenciar Unidades
                  </a>
                  <a [routerLink]="['/property', currentProperty.id, 'work-orders']"
                     class="block w-full btn btn-secondary text-center">
                    Ordens de Servico
                  </a>
                  <a [routerLink]="['/property', currentProperty.id, 'compliance']"
                     class="block w-full btn btn-secondary text-center">
                    Compliance
                  </a>
                  <a [routerLink]="['/property', currentProperty.id, 'documents']"
                     class="block w-full btn btn-secondary text-center">
                    Documentos
                  </a>
                  <a [routerLink]="['/property', currentProperty.id, 'incidents']"
                     class="block w-full btn btn-secondary text-center">
                    Incidentes
                  </a>
                  <a [routerLink]="['/property', currentProperty.id, 'finances']"
                     class="block w-full btn btn-secondary text-center">
                    Financas
                  </a>
                }
                <a [routerLink]="['/chat']" [queryParams]="{property: currentProperty.id}"
                   class="block w-full btn btn-secondary text-center">
                  Abrir Chat
                </a>
              </div>
            </div>

            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Enviar nova foto</h3>
              <div class="space-y-3">
                <input #imageDescription type="text" class="input w-full" placeholder="Descrição opcional" />
                <label class="flex items-center gap-2 text-sm text-gray-700">
                  <input #markPrimary type="checkbox" class="h-4 w-4" />
                  Definir como imagem principal
                </label>
                <button
                  type="button"
                  class="btn btn-primary w-full"
                  [disabled]="!selectedFile || uploadingImage()"
                  (click)="uploadImage(currentProperty.id, imageDescription.value, markPrimary.checked)"
                >
                  {{ uploadingImage() ? 'Enviando...' : 'Enviar foto' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      @if (!loading() && !property() && errorMessage()) {
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }
      </div>
  `
})
export class PropertyDetailComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly addressService = inject(AddressService);
  public readonly currencyService = inject(CurrencyService);
  private readonly propertyImageService = inject(PropertyImageService);
  private readonly route = inject(ActivatedRoute);

  readonly property = signal<Property | null>(null);
  readonly propertyImages = signal<PropertyImage[]>([]);
  readonly loading = signal<boolean>(true);
  readonly uploadingImage = signal<boolean>(false);
  readonly updatingImageId = signal<number | null>(null);
  readonly isDragOver = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly imageUploadError = signal<string>('');
  readonly imageUploadSuccess = signal<string>('');
  readonly selectedFileName = signal<string>('');
  readonly countries = signal<Record<string, string>>({});
  selectedFile: File | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadCountries();
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadProperty(id);
    });
  }

  loadCountries(): void {
    this.addressService.getSupportedCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  loadProperty(id: number): void {
    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid property id.');
      return;
    }

    console.info('[PropertyDetail] load:start', { id });
    this.loading.set(true);
    this.errorMessage.set('');
    this.property.set(null);

    this.propertyService.getPropertyById(id).pipe(timeout(15000)).subscribe({
      next: (data) => {
        console.info('[PropertyDetail] load:success', { id, hasData: !!data, propertyId: data?.id });
        this.property.set(data);
        this.loadPropertyImages(id);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.errorMessage.set(error?.error?.message ?? 'Could not load property details.');
        this.loading.set(false);
      }
    });
  }

  loadPropertyImages(id: number): void {
    this.propertyImageService.getPropertyImages(id).subscribe({
      next: (images) => {
        this.propertyImages.set(images ?? []);
      },
      error: (error) => {
        console.error('Error loading property images:', error);
        this.propertyImages.set([]);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.setSelectedFile(input?.files?.item(0) ?? null);
    this.imageUploadError.set('');
    this.imageUploadSuccess.set('');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent, propertyId: number): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.item(0) ?? null;
    this.setSelectedFile(file);
    if (file) {
      this.uploadImage(propertyId);
    }
  }

  uploadImage(propertyId: number, description?: string, isPrimary = false): void {
    if (!this.selectedFile) {
      this.imageUploadError.set('Selecione uma imagem primeiro.');
      return;
    }

    this.uploadingImage.set(true);
    this.imageUploadError.set('');
    this.imageUploadSuccess.set('');

    this.propertyImageService.uploadImage(propertyId, this.selectedFile, description, isPrimary).subscribe({
      next: () => {
        this.imageUploadSuccess.set('Imagem enviada com sucesso.');
        this.clearSelectedFile();
        this.reloadPropertyState(propertyId);
      },
      error: (error) => {
        console.error('Error uploading property image:', error);
        this.imageUploadError.set(error?.error?.message ?? 'Não foi possível enviar a imagem.');
        this.uploadingImage.set(false);
      }
    });
  }

  setPrimaryImage(propertyId: number, imageId: number): void {
    this.updatingImageId.set(imageId);
    this.propertyImageService.setPrimaryImage(propertyId, imageId).subscribe({
      next: () => {
        this.imageUploadSuccess.set('Imagem principal atualizada.');
        this.reloadPropertyState(propertyId, imageId);
      },
      error: (error) => {
        console.error('Error setting primary image:', error);
        this.imageUploadError.set(error?.error?.message ?? 'Não foi possível definir a imagem principal.');
        this.updatingImageId.set(null);
      }
    });
  }

  deleteImage(propertyId: number, imageId: number): void {
    if (!confirm('Excluir esta imagem?')) {
      return;
    }

    this.updatingImageId.set(imageId);
    this.propertyImageService.deleteImage(propertyId, imageId).subscribe({
      next: () => {
        this.imageUploadSuccess.set('Imagem excluída com sucesso.');
        this.reloadPropertyState(propertyId, imageId);
      },
      error: (error) => {
        console.error('Error deleting property image:', error);
        this.imageUploadError.set(error?.error?.message ?? 'Não foi possível excluir a imagem.');
        this.updatingImageId.set(null);
      }
    });
  }

  imageUrl(image: PropertyImage, propertyId: number): string {
    return this.propertyImageService.getImageUrl(image.imageUrl) || this.getDemoImageSrc(propertyId + image.id);
  }

  getPropertyHeroImage(property: Property): string {
    return this.propertyImageService.getImageUrl(property.primaryImageUrl) || this.getDemoImageSrc(property.id);
  }

  onHeroImageError(event: Event, property: Property): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = this.getDemoImageSrc(property.id);
    }
  }

  private reloadPropertyState(propertyId: number, imageIdToRelease: number | null = null): void {
    this.loadPropertyImages(propertyId);
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (property) => {
        this.property.set(property);
        this.uploadingImage.set(false);
        if (imageIdToRelease !== null && this.updatingImageId() === imageIdToRelease) {
          this.updatingImageId.set(null);
        }
      },
      error: (error) => {
        console.error('Error refreshing property after image change:', error);
        this.uploadingImage.set(false);
        if (imageIdToRelease !== null && this.updatingImageId() === imageIdToRelease) {
          this.updatingImageId.set(null);
        }
      }
    });
  }

  private setSelectedFile(file: File | null): void {
    this.selectedFile = file;
    this.selectedFileName.set(file?.name ?? '');
  }

  private clearSelectedFile(): void {
    this.setSelectedFile(null);
  }

  private getDemoImageSrc(propertyId: number): string {
    const demoImages = [
      '/assets/demo-property-images/property-1.svg',
      '/assets/demo-property-images/property-2.svg',
      '/assets/demo-property-images/property-3.svg'
    ];

    return demoImages[Math.abs(propertyId) % demoImages.length];
  }

  getCountryName(countryCode: string): string {
    return this.countries()[countryCode] || countryCode;
  }

  getPropertyTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'APARTMENT': 'Apartamento',
      'HOUSE': 'Casa',
      'BUILDING': 'Prédio',
      'COMMERCIAL_UNIT': 'Unidade comercial',
      'COMMERCIAL_BUILDING': 'Edifício comercial'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Ativo',
      'INACTIVE': 'Inativo',
      'MAINTENANCE': 'Manutenção',
      'SOLD': 'Vendido'
    };
    return labels[status] || status;
  }

  isBuildingProperty(property: Property): boolean {
    return isMultiUnitProperty(property.propertyType);
  }
}
