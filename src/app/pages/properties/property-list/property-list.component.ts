import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { Property } from '../../../models/property.model';
import { Page } from '../../../models/page.model';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Propriedades</h1>
        <a routerLink="/properties/new" class="btn btn-primary">
          Nova Propriedade
        </a>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Carregando...</p>
      </div>

      <div *ngIf="!loading && properties.length === 0" class="card text-center py-8">
        <p class="text-gray-500 mb-4">Nenhuma propriedade encontrada.</p>
        <a routerLink="/properties/new" class="btn btn-primary">
          Cadastrar Propriedade
        </a>
      </div>

      <div *ngIf="!loading && properties.length > 0" class="space-y-4">
        <div *ngFor="let property of properties" class="card hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ property.name }}</h3>
              <p class="text-gray-600 mb-2">{{ property.description }}</p>
              <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>Tipo: {{ getPropertyTypeLabel(property.propertyType) }}</span>
                <span *ngIf="property.bedrooms">Quartos: {{ property.bedrooms }}</span>
                <span *ngIf="property.bathrooms">Banheiros: {{ property.bathrooms }}</span>
                <span *ngIf="property.parkingSpaces">Vagas: {{ property.parkingSpaces }}</span>
                <span *ngIf="property.areaSize">Área: {{ property.areaSize }}m²</span>
              </div>
              <p class="text-sm text-gray-500 mt-2" *ngIf="property.address">
                {{ property.address.street }}, {{ property.address.number }} - {{ property.address.city }}, {{ property.address.state }}
              </p>
            </div>
            <div class="flex flex-col items-end space-y-2">
              <span [ngClass]="{
                'bg-green-100 text-green-800': property.status === 'ACTIVE',
                'bg-gray-100 text-gray-800': property.status === 'INACTIVE',
                'bg-yellow-100 text-yellow-800': property.status === 'MAINTENANCE',
                'bg-red-100 text-red-800': property.status === 'SOLD'
              }" class="px-3 py-1 text-sm font-medium rounded-full">
                {{ getStatusLabel(property.status) }}
              </span>
              <div class="flex space-x-2">
                <a [routerLink]="['/properties', property.id]" class="btn btn-secondary text-sm">
                  Ver
                </a>
                <a [routerLink]="['/properties', property.id, 'edit']" class="btn btn-primary text-sm">
                  Editar
                </a>
                <button (click)="deleteProperty(property.id)" class="btn btn-danger text-sm">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && totalPages > 1" class="flex justify-center mt-8 space-x-2">
        <button (click)="loadPage(currentPage - 1)" [disabled]="currentPage === 0"
                class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
          Anterior
        </button>
        <span class="flex items-center px-4 text-gray-700">
          Página {{ currentPage + 1 }} de {{ totalPages }}
        </span>
        <button (click)="loadPage(currentPage + 1)" [disabled]="currentPage === totalPages - 1"
                class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
          Próxima
        </button>
      </div>
    </div>
  `
})
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.propertyService.getAllProperties(page, this.pageSize).subscribe({
      next: (data: Page<Property>) => {
        this.properties = data.content;
        this.currentPage = data.pageable.pageNumber;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.loading = false;
      }
    });
  }

  deleteProperty(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta propriedade?')) {
      this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          this.loadPage(this.currentPage);
        },
        error: (error) => {
          console.error('Error deleting property:', error);
          alert('Erro ao excluir propriedade');
        }
      });
    }
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
