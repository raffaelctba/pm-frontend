import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm text-gray-500">Total de Propriedades</p>
              <p class="text-3xl font-bold text-primary-600">{{ properties.length }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm text-gray-500">Faturas Pendentes</p>
              <p class="text-3xl font-bold text-yellow-600">0</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm text-gray-500">Mensagens Não Lidas</p>
              <p class="text-3xl font-bold text-red-600">0</p>
            </div>
          </div>
        </div>
      </div>

      <!-- My Properties -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Minhas Propriedades</h2>
          <a routerLink="/properties/new" class="btn btn-primary">
            Nova Propriedade
          </a>
        </div>

        <div *ngIf="loading" class="text-center py-8">
          <p class="text-gray-500">Carregando...</p>
        </div>

        <div *ngIf="!loading && properties.length === 0" class="text-center py-8">
          <p class="text-gray-500">Você ainda não possui propriedades cadastradas.</p>
          <a routerLink="/properties/new" class="btn btn-primary mt-4">
            Cadastrar Primeira Propriedade
          </a>
        </div>

        <div *ngIf="!loading && properties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let property of properties" class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ property.name }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ property.propertyType }}</p>
            <p class="text-sm text-gray-500 mb-4" *ngIf="property.address">
              {{ property.address.city }}, {{ property.address.state }}
            </p>
            <div class="flex justify-between">
              <a [routerLink]="['/properties', property.id]" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                Ver Detalhes
              </a>
              <span [ngClass]="{
                'bg-green-100 text-green-800': property.status === 'ACTIVE',
                'bg-gray-100 text-gray-800': property.status === 'INACTIVE',
                'bg-yellow-100 text-yellow-800': property.status === 'MAINTENANCE',
                'bg-red-100 text-red-800': property.status === 'SOLD'
              }" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ property.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  properties: Property[] = [];
  loading = true;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.propertyService.getMyProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.loading = false;
      }
    });
  }
}
