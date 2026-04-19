import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice, InvoiceStatus } from '../../../models/invoice.model';
import { Page } from '../../../models/page.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Faturas</h1>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Carregando...</p>
      </div>

      <div *ngIf="!loading && invoices.length === 0" class="card text-center py-8">
        <p class="text-gray-500">Nenhuma fatura encontrada.</p>
      </div>

      <div *ngIf="!loading && invoices.length > 0" class="space-y-4">
        <div *ngFor="let invoice of invoices" class="card hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-semibold text-gray-900">{{ invoice.invoiceNumber }}</h3>
                <span [ngClass]="{
                  'bg-yellow-100 text-yellow-800': invoice.status === 'PENDING',
                  'bg-green-100 text-green-800': invoice.status === 'PAID',
                  'bg-red-100 text-red-800': invoice.status === 'OVERDUE',
                  'bg-gray-100 text-gray-800': invoice.status === 'CANCELLED',
                  'bg-blue-100 text-blue-800': invoice.status === 'PARTIALLY_PAID'
                }" class="px-3 py-1 text-sm font-medium rounded-full">
                  {{ getStatusLabel(invoice.status) }}
                </span>
              </div>

              <p class="text-gray-600 mb-2">{{ invoice.description }}</p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Valor:</span>
                  <span class="ml-2 font-semibold text-gray-900">R$ {{ invoice.amount.toFixed(2) }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Vencimento:</span>
                  <span class="ml-2 font-semibold text-gray-900">{{ formatDate(invoice.dueDate) }}</span>
                </div>
                <div *ngIf="invoice.lateFee > 0">
                  <span class="text-gray-500">Multa:</span>
                  <span class="ml-2 font-semibold text-red-600">R$ {{ invoice.lateFee.toFixed(2) }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Total:</span>
                  <span class="ml-2 font-semibold text-gray-900">R$ {{ invoice.totalAmount.toFixed(2) }}</span>
                </div>
              </div>

              <p *ngIf="invoice.paidDate" class="text-sm text-green-600 mt-2">
                Pago em {{ formatDate(invoice.paidDate) }}
              </p>
            </div>

            <div class="flex flex-col space-y-2">
              <a [routerLink]="['/invoices', invoice.id]" class="btn btn-secondary text-sm">
                Ver Detalhes
              </a>
              <button *ngIf="invoice.status === 'DRAFT'"
                      [routerLink]="['/invoices', invoice.id, 'edit']"
                      class="btn btn-info text-sm">
                Editar
              </button>
              <button *ngIf="invoice.status === 'PENDING' || invoice.status === 'OVERDUE'"
                      (click)="markAsPaid(invoice.id)"
                      class="btn btn-primary text-sm">
                Marcar como Pago
              </button>
              <button *ngIf="isFinalized(invoice.status)"
                      (click)="showActions(invoice.id)"
                      class="btn btn-secondary text-sm">
                Ações
              </button>
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
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = true;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  constructor(
    private invoiceService: InvoiceService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.invoiceService.getAllInvoices(page, this.pageSize).subscribe({
      next: (data: Page<Invoice>) => {
        this.ngZone.run(() => {
          this.invoices = data.content;
          this.currentPage = data.pageable.pageNumber;
          this.totalPages = data.totalPages;
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.ngZone.run(() => {
          this.loading = false;
        });
      }
    });
  }

  markAsPaid(id: number): void {
    if (confirm('Confirma o pagamento desta fatura?')) {
      this.invoiceService.markAsPaid(id).subscribe({
        next: () => {
          this.loadPage(this.currentPage);
        },
        error: (error) => {
          console.error('Error marking invoice as paid:', error);
          alert('Erro ao marcar fatura como paga');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'PAID': 'Pago',
      'OVERDUE': 'Atrasado',
      'CANCELLED': 'Cancelado',
      'PARTIALLY_PAID': 'Parcialmente Pago'
    };
    return labels[status] || status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  isFinalized(status: string): boolean {
    return status !== 'DRAFT' && status !== 'PENDING' && status !== 'OVERDUE';
  }

  showActions(invoiceId: number): void {
    alert('Ações adicionais para a fatura ' + invoiceId);
    // This will be expanded with a proper action menu/modal
  }
}
