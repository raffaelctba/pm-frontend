import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice } from '../../../models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-4 py-6 max-w-4xl mx-auto">
      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Carregando...</p>
      </div>

      <div *ngIf="!loading && invoice">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">{{ invoice.invoiceNumber }}</h1>
          <a routerLink="/invoices" class="btn btn-secondary">
            Voltar
          </a>
        </div>

        <div class="card space-y-6">
          <!-- Status -->
          <div class="flex items-center justify-between pb-6 border-b">
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <span [ngClass]="{
                'bg-yellow-100 text-yellow-800': invoice.status === 'PENDING',
                'bg-green-100 text-green-800': invoice.status === 'PAID',
                'bg-red-100 text-red-800': invoice.status === 'OVERDUE',
                'bg-gray-100 text-gray-800': invoice.status === 'CANCELLED',
                'bg-blue-100 text-blue-800': invoice.status === 'PARTIALLY_PAID'
              }" class="px-4 py-2 text-lg font-medium rounded-full">
                {{ getStatusLabel(invoice.status) }}
              </span>
            </div>
            <button *ngIf="invoice.status === 'PENDING' || invoice.status === 'OVERDUE'"
                    (click)="markAsPaid()"
                    class="btn btn-primary">
              Marcar como Pago
            </button>
          </div>

          <!-- Invoice Details -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Detalhes da Fatura</h2>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Número da Fatura</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ invoice.invoiceNumber }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Data de Vencimento</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(invoice.dueDate) }}</dd>
              </div>
              <div *ngIf="invoice.referenceMonth">
                <dt class="text-sm font-medium text-gray-500">Mês de Referência</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatMonth(invoice.referenceMonth) }}</dd>
              </div>
              <div *ngIf="invoice.paidDate">
                <dt class="text-sm font-medium text-gray-500">Data de Pagamento</dt>
                <dd class="mt-1 text-sm text-green-600">{{ formatDate(invoice.paidDate) }}</dd>
              </div>
              <div *ngIf="invoice.description" class="md:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Descrição</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ invoice.description }}</dd>
              </div>
            </dl>
          </div>

          <!-- Amounts -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Valores</h2>
            <div class="space-y-3">
              <div class="flex justify-between text-lg">
                <span class="text-gray-600">Valor Base:</span>
                <span class="font-semibold text-gray-900">R$ {{ invoice.amount.toFixed(2) }}</span>
              </div>
              <div *ngIf="invoice.lateFee > 0" class="flex justify-between text-lg">
                <span class="text-gray-600">Multa por Atraso:</span>
                <span class="font-semibold text-red-600">R$ {{ invoice.lateFee.toFixed(2) }}</span>
              </div>
              <div *ngIf="invoice.interest > 0" class="flex justify-between text-lg">
                <span class="text-gray-600">Juros:</span>
                <span class="font-semibold text-red-600">R$ {{ invoice.interest.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-2xl pt-3 border-t-2">
                <span class="font-bold text-gray-900">Total:</span>
                <span class="font-bold text-primary-600">R$ {{ invoice.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div *ngIf="invoice.status === 'PAID'" class="bg-green-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-green-900 mb-2">Pagamento Confirmado</h3>
            <p class="text-green-800">
              Esta fatura foi paga em {{ formatDate(invoice.paidDate!) }}
            </p>
          </div>

          <!-- Overdue Warning -->
          <div *ngIf="invoice.status === 'OVERDUE'" class="bg-red-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-red-900 mb-2">Fatura Vencida</h3>
            <p class="text-red-800">
              Esta fatura está em atraso desde {{ formatDate(invoice.dueDate) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceDetailComponent implements OnInit {
  invoice?: Invoice;
  loading = true;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadInvoice(id);
    });
  }

  loadInvoice(id: number): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (data) => {
        this.invoice = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.loading = false;
      }
    });
  }

  markAsPaid(): void {
    if (this.invoice && confirm('Confirma o pagamento desta fatura?')) {
      this.invoiceService.markAsPaid(this.invoice.id).subscribe({
        next: (updated) => {
          this.invoice = updated;
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

  formatMonth(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
  }
}
