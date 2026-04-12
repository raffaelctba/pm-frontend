import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { PaymentMethod, ProcessInvoicePaymentResponse } from '../models';
import { PaymentService } from '../services';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="px-4 py-6 max-w-4xl mx-auto">
      <div class="mb-4">
        <a [routerLink]="['/invoices', invoiceId]" class="btn btn-secondary">Voltar para fatura</a>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Carregando checkout...</p>
      </div>

      <div *ngIf="!loading && invoice" class="space-y-6">
        <div class="card">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Pagamento da Fatura {{ invoice.invoiceNumber }}</h1>
          <p class="text-gray-600">Total: <span class="font-semibold">R$ {{ invoice.totalAmount.toFixed(2) }}</span></p>
        </div>

        <div class="card space-y-4">
          <h2 class="text-xl font-semibold text-gray-900">Escolha o método de pagamento</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button class="btn" [class.btn-primary]="selectedMethod === 'PIX'" (click)="selectedMethod = 'PIX'">PIX</button>
            <button class="btn" [class.btn-primary]="selectedMethod === 'CREDIT_CARD'" (click)="selectedMethod = 'CREDIT_CARD'">Cartão</button>
            <button class="btn" [class.btn-primary]="selectedMethod === 'BANK_TRANSFER'" (click)="selectedMethod = 'BANK_TRANSFER'">Transferência</button>
          </div>

          <div *ngIf="selectedMethod === 'PIX'" class="bg-sky-50 rounded-lg p-4">
            <h3 class="font-semibold text-sky-900 mb-2">Fluxo PIX</h3>
            <p class="text-sky-800 text-sm">Vamos gerar o código PIX para pagamento instantâneo.</p>
          </div>

          <div *ngIf="selectedMethod === 'CREDIT_CARD'" class="bg-purple-50 rounded-lg p-4 space-y-2">
            <h3 class="font-semibold text-purple-900">Fluxo Cartão</h3>
            <input [(ngModel)]="cardHolder" name="cardHolder" placeholder="Nome no cartão" class="input w-full" />
            <input [(ngModel)]="cardNumber" name="cardNumber" placeholder="Número do cartão" class="input w-full" />
            <div class="grid grid-cols-2 gap-2">
              <input [(ngModel)]="cardExpiry" name="cardExpiry" placeholder="MM/AA" class="input w-full" />
              <input [(ngModel)]="cardCvv" name="cardCvv" placeholder="CVV" class="input w-full" />
            </div>
            <p class="text-xs text-purple-700">Dados de cartão são apenas UX local nesta etapa; o backend processa por gateway abstrato.</p>
          </div>

          <div *ngIf="selectedMethod === 'BANK_TRANSFER'" class="bg-amber-50 rounded-lg p-4">
            <h3 class="font-semibold text-amber-900 mb-2">Fluxo Transferência Bancária</h3>
            <p class="text-amber-800 text-sm">Você receberá as instruções para concluir transferência pelo seu banco.</p>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">Valor (opcional para pagamento parcial)</label>
            <input type="number" [(ngModel)]="amount" name="amount" class="input w-full" min="0.01" step="0.01" />
          </div>

          <button class="btn btn-primary" (click)="processPayment()" [disabled]="processing">
            {{ processing ? 'Processando...' : 'Processar Pagamento' }}
          </button>
        </div>

        <div *ngIf="result" class="card space-y-3">
          <h2 class="text-xl font-semibold">Resultado</h2>
          <p><span class="font-medium">Status:</span> {{ result.status }}</p>
          <p><span class="font-medium">Gateway:</span> {{ result.gatewayProvider || '-' }}</p>
          <p><span class="font-medium">Mensagem:</span> {{ result.message }}</p>

          <div *ngIf="result.gatewayProvider === 'BRAZIL_PIX'" class="bg-sky-50 rounded-lg p-4">
            <h3 class="font-semibold text-sky-900">PIX QR / Copia e Cola</h3>
            <p class="text-sky-800 text-sm mb-2">{{ result.providerInstructions }}</p>
            <code class="block p-2 rounded bg-white border border-sky-200 text-xs break-all">{{ result.externalReference }}</code>
          </div>

          <div *ngIf="result.gatewayProvider === 'STRIPE_CARD'" class="bg-purple-50 rounded-lg p-4">
            <h3 class="font-semibold text-purple-900">Pagamento em Cartão</h3>
            <p class="text-purple-800 text-sm">{{ result.providerInstructions }}</p>
            <a *ngIf="result.checkoutUrl" [href]="result.checkoutUrl" class="mt-2 inline-block rounded bg-purple-600 px-3 py-2 text-xs font-medium text-white">
              Abrir checkout seguro
            </a>
          </div>

          <div *ngIf="selectedMethod === 'BANK_TRANSFER'" class="bg-amber-50 rounded-lg p-4">
            <h3 class="font-semibold text-amber-900">Instruções de Transferência</h3>
            <p class="text-amber-800 text-sm">{{ result.providerInstructions || 'Realize a transferência e aguarde confirmação.' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentCheckoutComponent implements OnInit {
  invoiceId = 0;
  invoice?: Invoice;
  loading = true;
  processing = false;

  selectedMethod: PaymentMethod = 'PIX';
  amount?: number;
  result?: ProcessInvoicePaymentResponse;

  cardHolder = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.invoiceId = Number(params['invoiceId']);
      if (this.invoiceId > 0) {
        this.loadInvoice(this.invoiceId);
      }
    });
  }

  loadInvoice(id: number): void {
    this.loading = true;
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice for payment:', error);
        this.loading = false;
      }
    });
  }

  processPayment(): void {
    if (!this.invoiceId) {
      return;
    }

    this.processing = true;
    this.paymentService.processInvoicePayment(this.invoiceId, {
      amount: this.amount,
      paymentMethod: this.selectedMethod,
      notes: this.selectedMethod === 'CREDIT_CARD' ? 'Card checkout UI flow' : undefined,
      redirectCheckout: this.selectedMethod === 'CREDIT_CARD' || this.selectedMethod === 'DEBIT_CARD',
      successUrl: `${window.location.origin}/invoices/${this.invoiceId}`,
      cancelUrl: `${window.location.origin}/invoices/${this.invoiceId}/pay`
    }).subscribe({
      next: (response) => {
        this.result = response;
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
          return;
        }
        this.processing = false;
        this.loadInvoice(this.invoiceId);
      },
      error: (error) => {
        console.error('Error processing payment:', error);
        this.processing = false;
      }
    });
  }
}

