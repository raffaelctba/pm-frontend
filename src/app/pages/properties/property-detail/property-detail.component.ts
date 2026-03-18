import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AddressService } from '../../../services/address.service';
import { CurrencyService } from '../../../services/currency.service';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-4 py-6 max-w-6xl mx-auto">
      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Carregando...</p>
      </div>

      <div *ngIf="!loading && property">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">{{ property.name }}</h1>
          <div class="flex space-x-2">
            <a [routerLink]="['/properties', property.id, 'edit']" class="btn btn-primary">
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
                  <dd class="mt-1 text-sm text-gray-900">{{ getPropertyTypeLabel(property.propertyType) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Status</dt>
                  <dd class="mt-1">
                    <span [ngClass]="{
                      'bg-green-100 text-green-800': property.status === 'ACTIVE',
                      'bg-gray-100 text-gray-800': property.status === 'INACTIVE',
                      'bg-yellow-100 text-yellow-800': property.status === 'MAINTENANCE',
                      'bg-red-100 text-red-800': property.status === 'SOLD'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getStatusLabel(property.status) }}
                    </span>
                  </dd>
                </div>
                <div *ngIf="property.description" class="md:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">Descrição</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ property.description }}</dd>
                </div>
              </dl>
            </div>

            <div class="card" *ngIf="property.address">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Endereço</h2>
              <p class="text-gray-900">
                {{ property.address.street }}, {{ property.address.number }}
                <span *ngIf="property.address.complement"> - {{ property.address.complement }}</span>
              </p>
              <p class="text-gray-900">
                {{ property.address.neighborhood }}, {{ property.address.city }} - {{ property.address.state }}
              </p>
              <p class="text-gray-900" *ngIf="property.address.zipCode">{{ property.address.zipCode }}</p>
              <p class="text-gray-900 mt-2">{{ getCountryName(property.address.countryCode) }}</p>
            </div>

            <div class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Características</h2>
              <dl class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div *ngIf="property.areaSize">
                  <dt class="text-sm font-medium text-gray-500">Área</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">{{ property.areaSize }}m²</dd>
                </div>
                <div *ngIf="property.bedrooms">
                  <dt class="text-sm font-medium text-gray-500">Quartos</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">{{ property.bedrooms }}</dd>
                </div>
                <div *ngIf="property.bathrooms">
                  <dt class="text-sm font-medium text-gray-500">Banheiros</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">{{ property.bathrooms }}</dd>
                </div>
                <div *ngIf="property.parkingSpaces">
                  <dt class="text-sm font-medium text-gray-500">Vagas</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">{{ property.parkingSpaces }}</dd>
                </div>
              </dl>
            </div>

            <div *ngIf="property.isBuilding" class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Informações do Prédio</h2>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngIf="property.totalUnits">
                  <dt class="text-sm font-medium text-gray-500">Total de Unidades</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ property.totalUnits }}</dd>
                </div>
                <div *ngIf="property.monthlyFee">
                  <dt class="text-sm font-medium text-gray-500">Taxa Mensal</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ currencyService.formatCurrency(property.monthlyFee, property.currencyCode || 'BRL') }}</dd>
                </div>
                <div *ngIf="property.dueDay">
                  <dt class="text-sm font-medium text-gray-500">Dia de Vencimento</dt>
                  <dd class="mt-1 text-sm text-gray-900">Dia {{ property.dueDay }}</dd>
                </div>
                <div *ngIf="property.lateFeePercentage">
                  <dt class="text-sm font-medium text-gray-500">Multa por Atraso</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ property.lateFeePercentage }}%</dd>
                </div>
                <div *ngIf="property.interestRateMonthly">
                  <dt class="text-sm font-medium text-gray-500">Juros Mensal</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ property.interestRateMonthly }}%</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div class="space-y-2">
                <a [routerLink]="['/invoices']" [queryParams]="{property: property.id}"
                   class="block w-full btn btn-primary text-center">
                  Ver Faturas
                </a>
                <a [routerLink]="['/chat']" [queryParams]="{property: property.id}"
                   class="block w-full btn btn-secondary text-center">
                  Abrir Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PropertyDetailComponent implements OnInit {
  property?: Property;
  loading = true;
  countries: {[key: string]: string} = {};

  constructor(
    private propertyService: PropertyService,
    private addressService: AddressService,
    public currencyService: CurrencyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProperty(id);
    });
  }

  loadCountries(): void {
    this.addressService.getSupportedCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  loadProperty(id: number): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (data) => {
        this.property = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.loading = false;
      }
    });
  }

  getCountryName(countryCode: string): string {
    return this.countries[countryCode] || countryCode;
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
