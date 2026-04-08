import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AddressService } from '../../../services/address.service';
import { CurrencyService } from '../../../services/currency.service';
import { Property } from '../../../models/property.model';
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
              {{ currentProperty.isBuilding ? 'Abrir painel do prédio' : 'Abrir workspace do imóvel' }}
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

            @if (currentProperty.isBuilding) {
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
                @if (currentProperty.isBuilding) {
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
  private readonly route = inject(ActivatedRoute);

  readonly property = signal<Property | null>(null);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly countries = signal<Record<string, string>>({});

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
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.errorMessage.set(error?.error?.message ?? 'Could not load property details.');
        this.loading.set(false);
      }
    });
  }

  getCountryName(countryCode: string): string {
    return this.countries()[countryCode] || countryCode;
  }

  getPropertyTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'APARTMENT': 'Apartamento',
      'HOUSE': 'Casa',
      'BUILDING': 'Prédio',
      'COMMERCIAL': 'Comercial',
      'LAND': 'Terreno'
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
}
