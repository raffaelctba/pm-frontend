import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice } from '../../../models/invoice.model';
import { InvoiceAuditLog, InvoiceAdjustmentDTO, InvoiceVoidReissueDTO } from '../../../models/invoice-audit.model';
import { InvoiceLineItem, InvoiceDelivery, PaymentReversal, SendInvoiceDTO, PaymentReversalDTO, VoidInvoiceDTO } from '../../../models/invoice-lifecycle.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="px-4 py-6 max-w-4xl mx-auto">
      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Carregando...</p>
      </div>

      <div *ngIf="!loading && invoice">
        <div class="flex justify-between items-center mb-6">
           <h1 class="text-3xl font-bold text-gray-900">{{ invoice.invoiceNumber }}</h1>
           <button (click)="goBack()" class="btn btn-secondary">
             Voltar
           </button>
         </div>

        <div class="card space-y-6">
           <!-- Status and Actions -->
           <div class="flex items-center justify-between pb-6 border-b">
             <div>
               <p class="text-sm text-gray-500">Status</p>
               <span [ngClass]="{
                 'bg-blue-100 text-blue-800': invoice.status === 'DRAFT',
                 'bg-yellow-100 text-yellow-800': invoice.status === 'PENDING',
                 'bg-green-100 text-green-800': invoice.status === 'PAID',
                 'bg-red-100 text-red-800': invoice.status === 'OVERDUE',
                 'bg-gray-100 text-gray-800': invoice.status === 'CANCELLED' || invoice.status === 'VOIDED',
                 'bg-purple-100 text-purple-800': invoice.status === 'PARTIALLY_PAID'
               }" class="px-4 py-2 text-lg font-medium rounded-full">
                 {{ getStatusLabel(invoice.status) }}
               </span>
             </div>
             <div class="flex gap-2">
               <!-- Edit button for DRAFT only -->
               <button *ngIf="invoice.status === 'DRAFT'"
                       (click)="editInvoice()"
                       class="btn btn-info">
                 Editar
               </button>
               <!-- Finalize button for DRAFT -->
               <button *ngIf="invoice.status === 'DRAFT'"
                       (click)="finalizeInvoice()"
                       class="btn btn-primary">
                 Finalizar
               </button>
               <!-- Payment buttons -->
               <a *ngIf="invoice.status === 'PENDING' || invoice.status === 'OVERDUE'"
                  [routerLink]="['/invoices', invoice.id, 'pay']"
                  class="btn btn-primary">
                 Pagar Agora
               </a>
               <button *ngIf="invoice.status === 'PENDING' || invoice.status === 'OVERDUE'"
                       (click)="markAsPaid()"
                       class="btn btn-secondary">
                 Marcar como Pago
               </button>
               <!-- Actions for finalized invoices -->
               <button *ngIf="isFinalized(invoice.status)"
                       (click)="toggleActionMenu()"
                       class="btn btn-secondary">
                 Ações {{ showActionMenu ? '▼' : '▶' }}
               </button>
             </div>
           </div>

           <!-- Action Menu for Finalized Invoices -->
           <div *ngIf="showActionMenu && isFinalized(invoice.status)" class="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
             <h3 class="font-semibold text-gray-900 mb-3">Ações Disponíveis</h3>
             <div class="space-y-2">
               <button (click)="openSendInvoiceDialog()"
                       class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                 📧 Enviar Fatura
               </button>
               <button (click)="openCreditNoteDialog()"
                       class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                 💰 Criar Nota de Crédito
               </button>
               <button (click)="openDebitNoteDialog()"
                       class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                 📊 Criar Nota de Débito
               </button>
               <button *ngIf="canReversePayment()" (click)="openPaymentReversalDialog()"
                       class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                 ↩️ Reverter Pagamento
               </button>
               <button (click)="openVoidReissueDialog()"
                       class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                 🔄 Anular e Reemitir
               </button>
               <button (click)="openVoidDialog()"
                       class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-red-600">
                 ❌ Anular Fatura
               </button>
             </div>
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

          <!-- Charge Groups (Finalized Invoices) -->
          <div *ngIf="invoice.status !== 'DRAFT' && groupedLineItems.length > 0" class="border-t pt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Detalhamento por Tipo de Cobranca</h2>
            <div class="space-y-4">
              <div *ngFor="let group of groupedLineItems" class="rounded-lg border border-slate-200 bg-white">
                <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50 rounded-t-lg">
                  <p class="font-semibold text-slate-900">{{ group.chargeTypeLabel }}</p>
                  <p class="text-sm font-semibold text-slate-700">Subtotal: R$ {{ group.subtotal.toFixed(2) }}</p>
                </div>
                <div class="divide-y divide-slate-100">
                  <div *ngFor="let item of group.items" class="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-medium text-slate-900">{{ item.description }}</p>
                      <p class="text-xs text-slate-500">{{ item.quantity }}x R$ {{ item.unitPrice.toFixed(2) }}</p>
                    </div>
                    <p class="text-sm font-semibold text-slate-900">R$ {{ getLineItemAmount(item).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Line Items (Draft Only) -->
          <div *ngIf="invoice.status === 'DRAFT'">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Itens da Fatura</h2>
              <button (click)="openAddLineItemDialog()" class="btn btn-sm btn-primary">
                + Adicionar Item
              </button>
            </div>
            <div *ngIf="!lineItems || lineItems.length === 0" class="text-center py-4 text-gray-500">
              Nenhum item adicionado. Clique em "Adicionar Item" para começar.
            </div>
            <div *ngIf="lineItems && lineItems.length > 0" class="space-y-2">
              <div *ngFor="let item of lineItems" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ item.description }}</p>
                  <p class="text-sm text-gray-500">{{ item.quantity }}x R$ {{ item.unitPrice.toFixed(2) }} = R$ {{ (item.lineTotal ?? 0).toFixed(2) }}</p>
                </div>
                <div class="flex gap-2">
                  <button (click)="editLineItem(item)" class="text-blue-600 hover:text-blue-800">✏️</button>
                  <button (click)="deleteLineItem(item.id)" class="text-red-600 hover:text-red-800">🗑️</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery Status -->
          <div *ngIf="isFinalized(invoice.status)" class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Status de Entrega</h2>
                <p class="text-sm text-gray-500 mt-1">{{ getDeliveryStatusLabel(invoice.deliveryStatus) }}</p>
              </div>
              <button *ngIf="invoice.deliveryStatus === 'NOT_SENT'" (click)="openSendInvoiceDialog()" class="btn btn-sm btn-primary">
                📧 Enviar Agora
              </button>
            </div>
            <div *ngIf="deliveryHistory && deliveryHistory.length > 0" class="space-y-2">
              <div *ngFor="let delivery of deliveryHistory" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ delivery.deliveryMethod }}</p>
                    <p class="text-sm text-gray-600">{{ formatDateTime(delivery.createdAt || '') }}</p>
                    <p *ngIf="delivery.recipientEmail" class="text-sm text-gray-600">📧 {{ delivery.recipientEmail }}</p>
                  </div>
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': delivery.status === 'VIEWED',
                    'bg-yellow-100 text-yellow-800': delivery.status === 'SENT_EMAIL',
                    'bg-red-100 text-red-800': delivery.status === 'FAILED'
                  }" class="px-2 py-1 text-xs font-medium rounded">
                    {{ delivery.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Reversals (Paid/Partially Paid) -->
          <div *ngIf="canReversePayment()" class="border-t pt-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Reversões de Pagamento</h2>
              <button (click)="openPaymentReversalDialog()" class="btn btn-sm btn-secondary">
                ↩️ Reverter Pagamento
              </button>
            </div>
            <div *ngIf="!paymentReversals || paymentReversals.length === 0" class="text-center py-4 text-gray-500">
              Nenhuma reversão registrada
            </div>
            <div *ngIf="paymentReversals && paymentReversals.length > 0" class="space-y-2">
              <div *ngFor="let reversal of paymentReversals" class="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">Reversão: R$ {{ reversal.reversalAmount.toFixed(2) }}</p>
                    <p class="text-sm text-gray-600">{{ reversal.reason }}</p>
                    <p class="text-sm text-gray-500">{{ formatDateTime(reversal.createdAt || '') }}</p>
                  </div>
                  <span class="text-xs font-medium text-orange-800">REVERTIDO</span>
                </div>
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

           <!-- Audit Timeline -->
           <div class="mt-8">
             <h2 class="text-xl font-semibold text-gray-900 mb-4">Histórico de Auditoria</h2>
             <div *ngIf="auditLoading" class="text-center py-4">
               <p class="text-gray-500">Carregando histórico...</p>
             </div>
             <div *ngIf="!auditLoading && auditLogs.length === 0" class="text-center py-4 text-gray-500">
               Nenhum evento registrado
             </div>
             <div *ngIf="!auditLoading && auditLogs.length > 0" class="space-y-4">
               <div *ngFor="let log of auditLogs" class="flex gap-4 border-l-2 border-blue-400 pl-4 py-2">
                 <div class="shrink-0 w-3 h-3 bg-blue-400 rounded-full mt-2 -ml-5"></div>
                 <div class="flex-1">
                   <div class="flex justify-between items-start">
                     <div>
                       <p class="font-semibold text-gray-900">{{ getAuditActionLabel(log.action) }}</p>
                       <p *ngIf="log.details" class="text-sm text-gray-600">{{ log.details }}</p>
                     </div>
                     <span class="text-sm text-gray-500">{{ formatDateTime(log.createdAt) }}</span>
                   </div>
                   <div *ngIf="log.sourceInvoiceId || log.targetInvoiceId" class="text-xs text-gray-500 mt-2">
                     <p *ngIf="log.sourceInvoiceId">
                       Origem: <span class="font-mono">{{ log.sourceInvoiceId }}</span>
                     </p>
                     <p *ngIf="log.targetInvoiceId">
                       Destino: <span class="font-mono">{{ log.targetInvoiceId }}</span>
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <!-- Credit Note Dialog -->
           <div *ngIf="showCreditNoteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 class="text-lg font-semibold text-gray-900 mb-4">Criar Nota de Crédito</h3>
               <form (ngSubmit)="submitCreditNote()" class="space-y-4">
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Valor (R$)</label>
                   <input type="number" [(ngModel)]="adjustmentForm.amount" name="amount"
                          step="0.01" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Descrição</label>
                   <textarea [(ngModel)]="adjustmentForm.description" name="description"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                   <input type="date" [(ngModel)]="adjustmentForm.dueDate" name="dueDate"
                          required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div class="flex gap-2 justify-end">
                   <button type="button" (click)="closeCreditNoteDialog()"
                           class="btn btn-secondary">
                     Cancelar
                   </button>
                   <button type="submit" class="btn btn-primary">
                     Criar Nota
                   </button>
                 </div>
               </form>
             </div>
           </div>

           <!-- Debit Note Dialog -->
           <div *ngIf="showDebitNoteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 class="text-lg font-semibold text-gray-900 mb-4">Criar Nota de Débito</h3>
               <form (ngSubmit)="submitDebitNote()" class="space-y-4">
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Valor (R$)</label>
                   <input type="number" [(ngModel)]="adjustmentForm.amount" name="amount"
                          step="0.01" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Descrição</label>
                   <textarea [(ngModel)]="adjustmentForm.description" name="description"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                   <input type="date" [(ngModel)]="adjustmentForm.dueDate" name="dueDate"
                          required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div class="flex gap-2 justify-end">
                   <button type="button" (click)="closeDebitNoteDialog()"
                           class="btn btn-secondary">
                     Cancelar
                   </button>
                   <button type="submit" class="btn btn-primary">
                     Criar Nota
                   </button>
                 </div>
               </form>
             </div>
           </div>

           <!-- Void & Reissue Dialog -->
           <div *ngIf="showVoidReissueDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 class="text-lg font-semibold text-gray-900 mb-4">Anular e Reemitir Fatura</h3>
               <form (ngSubmit)="submitVoidReissue()" class="space-y-4">
                 <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                   <p class="text-sm text-yellow-800">
                     ⚠️ Esta ação irá anular a fatura atual e criar uma nova fatura com os mesmos dados.
                   </p>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Motivo</label>
                   <textarea [(ngModel)]="voidReissueForm.reason" name="reason"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" required></textarea>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Nova Data de Vencimento</label>
                   <input type="date" [(ngModel)]="voidReissueForm.newDueDate" name="newDueDate"
                          required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div class="flex gap-2 justify-end">
                   <button type="button" (click)="closeVoidReissueDialog()"
                           class="btn btn-secondary">
                     Cancelar
                   </button>
                   <button type="submit" class="btn btn-danger">
                     Anular e Reemitir
                   </button>
                 </div>
               </form>
             </div>
           </div>

           <!-- Line Item Dialog -->
           <div *ngIf="showLineItemDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ editingLineItemId ? 'Editar' : 'Adicionar' }} Item</h3>
               <form (ngSubmit)="submitLineItem()" class="space-y-4">
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Descrição *</label>
                   <input type="text" [(ngModel)]="lineItemForm.description" name="description"
                          required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Quantidade *</label>
                   <input type="number" [(ngModel)]="lineItemForm.quantity" name="quantity"
                          min="1" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Valor Unitário (R$) *</label>
                   <input type="number" [(ngModel)]="lineItemForm.unitPrice" name="unitPrice"
                          step="0.01" min="0" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Imposto (%)</label>
                   <input type="number" [(ngModel)]="lineItemForm.taxPercentage" name="taxPercentage"
                          step="0.01" min="0" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Desconto (%)</label>
                   <input type="number" [(ngModel)]="lineItemForm.discountPercentage" name="discountPercentage"
                          step="0.01" min="0" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div class="flex gap-2 justify-end">
                   <button type="button" (click)="closeLineItemDialog()"
                           class="btn btn-secondary">
                     Cancelar
                   </button>
                   <button type="submit" class="btn btn-primary">
                     {{ editingLineItemId ? 'Atualizar' : 'Adicionar' }}
                   </button>
                 </div>
               </form>
             </div>
           </div>

           <!-- Send Invoice Dialog -->
           <div *ngIf="showSendInvoiceDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 class="text-lg font-semibold text-gray-900 mb-4">Enviar Fatura</h3>
               <form (ngSubmit)="submitSendInvoice()" class="space-y-4">
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Método de Entrega *</label>
                   <select [(ngModel)]="sendInvoiceForm.deliveryMethod" name="deliveryMethod" required
                           class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                     <option value="">Selecione...</option>
                     <option value="EMAIL">Email</option>
                     <option value="PORTAL">Portal do Inquilino</option>
                     <option value="PRINT">Impressão</option>
                   </select>
                 </div>
                 <div *ngIf="sendInvoiceForm.deliveryMethod === 'EMAIL'">
                   <label class="block text-sm font-medium text-gray-700">Email *</label>
                   <input type="email" [(ngModel)]="sendInvoiceForm.recipientEmail" name="recipientEmail"
                          required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Notas</label>
                   <textarea [(ngModel)]="sendInvoiceForm.notes" name="notes"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                 </div>
                 <div class="flex gap-2 justify-end">
                   <button type="button" (click)="closeSendInvoiceDialog()"
                           class="btn btn-secondary">
                     Cancelar
                   </button>
                   <button type="submit" class="btn btn-primary">
                     Enviar
                   </button>
                 </div>
               </form>
             </div>
           </div>

           <!-- Payment Reversal Dialog -->
           <div *ngIf="showPaymentReversalDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 class="text-lg font-semibold text-gray-900 mb-4">Reverter Pagamento</h3>
               <form (ngSubmit)="submitPaymentReversal()" class="space-y-4">
                 <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                   <p class="text-sm text-yellow-800">
                     ⚠️ Esta ação irá reverter o pagamento e registrará a ação no histórico de auditoria.
                   </p>
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">ID do Pagamento *</label>
                    <input type="number" [(ngModel)]="paymentReversalForm.paymentId" name="paymentId"
                           min="1" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                  </div>
                  <div>
                   <label class="block text-sm font-medium text-gray-700">Valor a Reverter (R$) *</label>
                   <input type="number" [(ngModel)]="paymentReversalForm.reversalAmount" name="reversalAmount"
                          step="0.01" min="0.01" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Motivo *</label>
                   <textarea [(ngModel)]="paymentReversalForm.reason" name="reason"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" required></textarea>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Notas</label>
                   <textarea [(ngModel)]="paymentReversalForm.notes" name="notes"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="2"></textarea>
                 </div>
                 <div class="flex gap-2 justify-end">
                   <button type="button" (click)="closePaymentReversalDialog()"
                           class="btn btn-secondary">
                     Cancelar
                   </button>
                   <button type="submit" class="btn btn-danger">
                     Reverter Pagamento
                   </button>
                 </div>
               </form>
             </div>
           </div>

           <!-- Void Invoice Dialog -->
           <div *ngIf="showVoidDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 class="text-lg font-semibold text-gray-900 mb-4">Anular Fatura</h3>
               <form (ngSubmit)="submitVoid()" class="space-y-4">
                 <div class="bg-red-50 p-3 rounded-lg border border-red-200">
                   <p class="text-sm text-red-800">
                     ⚠️ Esta ação irá anular a fatura. A fatura será preservada no histórico, mas não será mais cobrável.
                   </p>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Motivo *</label>
                   <textarea [(ngModel)]="voidForm.reason" name="reason"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" required></textarea>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Notas</label>
                   <textarea [(ngModel)]="voidForm.notes" name="notes"
                             class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" rows="2"></textarea>
                 </div>
                 <div class="flex gap-2 justify-end">
                   <button type="button" (click)="closeVoidDialog()"
                           class="btn btn-secondary">
                     Cancelar
                   </button>
                   <button type="submit" class="btn btn-danger">
                     Anular Fatura
                   </button>
                 </div>
               </form>
             </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceDetailComponent implements OnInit {
  invoice?: Invoice;
  loading = true;
  auditLogs: InvoiceAuditLog[] = [];
  auditLoading = false;
  showActionMenu = false;
  showCreditNoteDialog = false;
  showDebitNoteDialog = false;
  showVoidReissueDialog = false;
  showLineItemDialog = false;
  showSendInvoiceDialog = false;
  showPaymentReversalDialog = false;
  showVoidDialog = false;

  // Data collections
  lineItems: InvoiceLineItem[] = [];
  groupedLineItems: Array<{
    chargeType: string;
    chargeTypeLabel: string;
    items: InvoiceLineItem[];
    subtotal: number;
  }> = [];
  deliveryHistory: InvoiceDelivery[] = [];
  paymentReversals: PaymentReversal[] = [];

  // Form states
  adjustmentForm = {
    amount: 0,
    description: '',
    dueDate: this.getTodayDate()
  };

  voidReissueForm = {
    reason: '',
    newDueDate: this.getTodayDate()
  };

  lineItemForm = {
    description: '',
    itemCode: '',
    quantity: 1,
    unitPrice: 0,
    taxPercentage: 0,
    discountPercentage: 0
  };

  sendInvoiceForm = {
    deliveryMethod: '',
    recipientEmail: '',
    notes: ''
  };

  paymentReversalForm = {
    paymentId: 0,
    reversalAmount: 0,
    reason: '',
    notes: ''
  };

  voidForm = {
    reason: '',
    notes: ''
  };

  editingLineItemId?: number;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadInvoice(id);
      this.loadAuditTrail(id);
    });
  }

  goBack(): void {
    this.location.back();
  }

  loadInvoice(id: number): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (data) => {
        this.invoice = data;
        this.loading = false;
        this.loadLineItems(id);
        this.loadDeliveryHistory(id);
        this.loadPaymentReversals(id);
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.loading = false;
      }
    });
  }

  loadAuditTrail(id: number): void {
    this.auditLoading = true;
    this.invoiceService.getAuditTrail(id).subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.auditLoading = false;
      },
      error: (error) => {
        // Silently handle 403/unauthorized errors for audit trail (permission-dependent)
        if (error?.status === 403) {
          console.warn('Audit trail access denied for invoice:', id);
        } else {
          console.error('Error loading audit trail:', error);
        }
        this.auditLoading = false;
        this.auditLogs = []; // Clear audit logs if access denied
      }
    });
  }

  markAsPaid(): void {
    if (this.invoice && confirm('Confirma o pagamento desta fatura?')) {
      this.invoiceService.markAsPaid(this.invoice.id).subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.loadAuditTrail(this.invoice!.id);
        },
        error: (error) => {
          console.error('Error marking invoice as paid:', error);
          alert('Erro ao marcar fatura como paga');
        }
      });
    }
  }

  editInvoice(): void {
    alert('Redirecionando para edição da fatura...');
    // TODO: Implement navigation to edit page or open edit dialog
  }

  finalizeInvoice(): void {
    if (this.invoice && confirm('Finalizar esta fatura? Ela não poderá ser editada depois.')) {
      this.invoiceService.finalizeDraftInvoice(this.invoice.id).subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.loadAuditTrail(this.invoice!.id);
          alert('Fatura finalizada com sucesso');
        },
        error: (error) => {
          console.error('Error finalizing invoice:', error);
          alert('Erro ao finalizar fatura: ' + error.error?.message);
        }
      });
    }
  }

  toggleActionMenu(): void {
    this.showActionMenu = !this.showActionMenu;
  }

  openCreditNoteDialog(): void {
    this.showActionMenu = false;
    this.adjustmentForm = {
      amount: 0,
      description: '',
      dueDate: this.getTodayDate()
    };
    this.showCreditNoteDialog = true;
  }

  closeCreditNoteDialog(): void {
    this.showCreditNoteDialog = false;
  }

  submitCreditNote(): void {
    if (this.invoice && this.adjustmentForm.amount > 0) {
      const request: InvoiceAdjustmentDTO = {
        amount: this.adjustmentForm.amount,
        description: this.adjustmentForm.description,
        dueDate: this.adjustmentForm.dueDate
      };

      this.invoiceService.createCreditNote(this.invoice.id, request).subscribe({
        next: () => {
          alert('Nota de crédito criada com sucesso');
          this.closeCreditNoteDialog();
          this.loadAuditTrail(this.invoice!.id);
        },
        error: (error) => {
          console.error('Error creating credit note:', error);
          alert('Erro ao criar nota de crédito: ' + error.error?.message);
        }
      });
    }
  }

  openDebitNoteDialog(): void {
    this.showActionMenu = false;
    this.adjustmentForm = {
      amount: 0,
      description: '',
      dueDate: this.getTodayDate()
    };
    this.showDebitNoteDialog = true;
  }

  closeDebitNoteDialog(): void {
    this.showDebitNoteDialog = false;
  }

  submitDebitNote(): void {
    if (this.invoice && this.adjustmentForm.amount > 0) {
      const request: InvoiceAdjustmentDTO = {
        amount: this.adjustmentForm.amount,
        description: this.adjustmentForm.description,
        dueDate: this.adjustmentForm.dueDate
      };

      this.invoiceService.createDebitNote(this.invoice.id, request).subscribe({
        next: () => {
          alert('Nota de débito criada com sucesso');
          this.closeDebitNoteDialog();
          this.loadAuditTrail(this.invoice!.id);
        },
        error: (error) => {
          console.error('Error creating debit note:', error);
          alert('Erro ao criar nota de débito: ' + error.error?.message);
        }
      });
    }
  }

  openVoidReissueDialog(): void {
    this.showActionMenu = false;
    this.voidReissueForm = {
      reason: '',
      newDueDate: this.getTodayDate()
    };
    this.showVoidReissueDialog = true;
  }

  closeVoidReissueDialog(): void {
    this.showVoidReissueDialog = false;
  }

  submitVoidReissue(): void {
    if (this.invoice && this.voidReissueForm.reason && this.voidReissueForm.newDueDate) {
      const request: InvoiceVoidReissueDTO = {
        reason: this.voidReissueForm.reason,
        newDueDate: this.voidReissueForm.newDueDate
      };

      this.invoiceService.voidAndReissue(this.invoice.id, request).subscribe({
        next: (result) => {
          alert('Fatura anulada e reemitida com sucesso. Nova fatura: ' + result.reissuedInvoice.invoiceNumber);
          this.closeVoidReissueDialog();
          this.loadInvoice(result.reissuedInvoice.id);
          this.loadAuditTrail(result.reissuedInvoice.id);
        },
        error: (error) => {
          console.error('Error voiding and reissuing invoice:', error);
          alert('Erro ao anular e reemitir fatura: ' + error.error?.message);
        }
      });
    }
  }

  isFinalized(status: string): boolean {
    return status !== 'DRAFT';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Rascunho',
      'PENDING': 'Pendente',
      'PAID': 'Pago',
      'OVERDUE': 'Atrasado',
      'CANCELLED': 'Cancelado',
      'PARTIALLY_PAID': 'Parcialmente Pago',
      'VOIDED': 'Anulado',
      'ISSUED': 'Emitido'
    };
    return labels[status] || status;
  }

  getAuditActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'DRAFT_CREATED': '📝 Rascunho Criado',
      'DRAFT_UPDATED': '✏️ Rascunho Atualizado',
      'DRAFT_FINALIZED': '🔒 Rascunho Finalizado',
      'PENDING': '⏳ Marcado como Pendente',
      'PAID': '✅ Marcado como Pago',
      'MARKED_AS_PAID': '✅ Marcado como Pago',
      'OVERDUE': '⏰ Marcado como Vencido',
      'CANCELLED': '❌ Cancelado',
      'VOIDED': '🗑️ Anulado',
      'REISSUED': '🔄 Reemitido',
      'CREDIT_NOTE_CREATED': '💚 Nota de Crédito Criada',
      'CREDIT_NOTE_LINKED': '🔗 Nota de Crédito Vinculada',
      'DEBIT_NOTE_CREATED': '💛 Nota de Débito Criada',
      'DEBIT_NOTE_LINKED': '🔗 Nota de Débito Vinculada'
    };
    return labels[action] || action;
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateTime?: string): string {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatMonth(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
  }

  // ==================== LINE ITEMS ====================

  loadLineItems(invoiceId?: number): void {
    const id = invoiceId ?? this.invoice?.id;
    if (!id) return;

    this.invoiceService.getLineItems(id).subscribe({
      next: (data) => {
        this.lineItems = data;
        this.rebuildLineItemGroups();
      },
      error: (error) => {
        console.error('Error loading line items:', error);
        this.lineItems = [];
        this.groupedLineItems = [];
      }
    });
  }

  private rebuildLineItemGroups(): void {
    const groups = new Map<string, { chargeType: string; chargeTypeLabel: string; items: InvoiceLineItem[]; subtotal: number }>();

    for (const item of this.lineItems) {
      const chargeType = (item.itemCode || 'CUSTOM').toUpperCase();
      const amount = this.getLineItemAmount(item);
      if (!groups.has(chargeType)) {
        groups.set(chargeType, {
          chargeType,
          chargeTypeLabel: this.getChargeTypeLabel(chargeType),
          items: [],
          subtotal: 0
        });
      }

      const current = groups.get(chargeType)!;
      current.items.push(item);
      current.subtotal += amount;
    }

    this.groupedLineItems = Array.from(groups.values()).sort((a, b) => a.chargeTypeLabel.localeCompare(b.chargeTypeLabel));
  }

  getLineItemAmount(item: InvoiceLineItem): number {
    if (typeof item.lineTotal === 'number') {
      return item.lineTotal;
    }
    return (item.quantity || 0) * (item.unitPrice || 0);
  }

  getChargeTypeLabel(chargeType: string): string {
    const labels: { [key: string]: string } = {
      'BASE_CHARGE': 'Cobranca Base',
      'PARKING': 'Estacionamento',
      'FACILITY_RENTAL': 'Aluguel de Facilidades',
      'ADMIN_FEE': 'Taxa Administrativa',
      'OTHER': 'Outras Taxas',
      'CUSTOM': 'Personalizado'
    };
    return labels[chargeType] || chargeType;
  }

  openAddLineItemDialog(): void {
    this.editingLineItemId = undefined;
    this.lineItemForm = {
      description: '',
      itemCode: '',
      quantity: 1,
      unitPrice: 0,
      taxPercentage: 0,
      discountPercentage: 0
    };
    this.showLineItemDialog = true;
  }

  editLineItem(item: InvoiceLineItem): void {
    this.editingLineItemId = item.id;
    this.lineItemForm = {
      description: item.description,
      itemCode: item.itemCode || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxPercentage: item.taxPercentage || 0,
      discountPercentage: item.discountPercentage || 0
    };
    this.showLineItemDialog = true;
  }

  closeLineItemDialog(): void {
    this.showLineItemDialog = false;
  }

  submitLineItem(): void {
    if (!this.invoice || this.lineItemForm.unitPrice <= 0) return;

    if (this.editingLineItemId) {
      this.invoiceService.updateLineItem(this.invoice.id, this.editingLineItemId, this.lineItemForm).subscribe({
        next: () => {
          this.closeLineItemDialog();
          this.loadLineItems(this.invoice!.id);
          this.loadInvoice(this.invoice!.id);
          alert('Item atualizado com sucesso');
        },
        error: (error) => {
          console.error('Error updating line item:', error);
          alert('Erro ao atualizar item: ' + (error.error?.message || 'tente novamente'));
        }
      });
    } else {
      this.invoiceService.addLineItem(this.invoice.id, this.lineItemForm).subscribe({
        next: () => {
          this.closeLineItemDialog();
          this.loadLineItems(this.invoice!.id);
          this.loadInvoice(this.invoice!.id);
          alert('Item adicionado com sucesso');
        },
        error: (error) => {
          console.error('Error adding line item:', error);
          alert('Erro ao adicionar item: ' + (error.error?.message || 'tente novamente'));
        }
      });
    }
  }

  deleteLineItem(itemId?: number): void {
    if (!this.invoice || !itemId || !confirm('Remover este item?')) return;

    this.invoiceService.deleteLineItem(this.invoice.id, itemId).subscribe({
      next: () => {
        this.loadLineItems(this.invoice!.id);
        this.loadInvoice(this.invoice!.id);
        alert('Item removido com sucesso');
      },
      error: (error) => {
        console.error('Error deleting line item:', error);
        alert('Erro ao remover item: ' + (error.error?.message || 'tente novamente'));
      }
    });
  }

  // ==================== DELIVERY ====================

  loadDeliveryHistory(invoiceId?: number): void {
    const id = invoiceId ?? this.invoice?.id;
    if (!id) return;

    this.invoiceService.getDeliveryHistory(id).subscribe({
      next: (data) => {
        this.deliveryHistory = data;
      },
      error: (error) => {
        console.error('Error loading delivery history:', error);
        this.deliveryHistory = [];
      }
    });
  }

  openSendInvoiceDialog(): void {
    this.showActionMenu = false;
    this.sendInvoiceForm = {
      deliveryMethod: 'EMAIL',
      recipientEmail: '',
      notes: ''
    };
    this.showSendInvoiceDialog = true;
  }

  closeSendInvoiceDialog(): void {
    this.showSendInvoiceDialog = false;
  }

  submitSendInvoice(): void {
    if (!this.invoice || !this.sendInvoiceForm.deliveryMethod) return;

    const sendDto: SendInvoiceDTO = {
      deliveryMethod: this.sendInvoiceForm.deliveryMethod,
      recipientEmail: this.sendInvoiceForm.recipientEmail,
      notes: this.sendInvoiceForm.notes
    };

    this.invoiceService.sendInvoice(this.invoice.id, sendDto).subscribe({
      next: () => {
        this.closeSendInvoiceDialog();
        this.loadDeliveryHistory(this.invoice!.id);
        this.loadInvoice(this.invoice!.id);
        this.loadAuditTrail(this.invoice!.id);
        alert('Fatura enviada com sucesso');
      },
      error: (error) => {
        console.error('Error sending invoice:', error);
        alert('Erro ao enviar fatura: ' + (error.error?.message || 'tente novamente'));
      }
    });
  }

  getDeliveryStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      'NOT_SENT': 'Não Enviada',
      'SENT_EMAIL': 'Enviada por Email',
      'SENT_PORTAL': 'Enviada via Portal',
      'SENT_PRINT': 'Impressão Realizada',
      'VIEWED': '👀 Visualizada',
      'FAILED': '❌ Falha na Entrega'
    };
    return labels[status || ''] || status || 'Desconhecido';
  }

  // ==================== PAYMENT REVERSALS ====================

  loadPaymentReversals(invoiceId?: number): void {
    const id = invoiceId ?? this.invoice?.id;
    if (!id) return;

    this.invoiceService.getPaymentReversals(id).subscribe({
      next: (data) => {
        this.paymentReversals = data;
      },
      error: (error) => {
        console.error('Error loading payment reversals:', error);
        this.paymentReversals = [];
      }
    });
  }

  canReversePayment(): boolean {
    if (!this.invoice) return false;
    return this.invoice.status === 'PAID' || this.invoice.status === 'PARTIALLY_PAID';
  }

  openPaymentReversalDialog(): void {
    this.showActionMenu = false;
    this.paymentReversalForm = {
      paymentId: 0,
      reversalAmount: 0,
      reason: '',
      notes: ''
    };
    this.showPaymentReversalDialog = true;
  }

  closePaymentReversalDialog(): void {
    this.showPaymentReversalDialog = false;
  }

  submitPaymentReversal(): void {
    if (!this.invoice || this.paymentReversalForm.paymentId <= 0 || this.paymentReversalForm.reversalAmount <= 0 || !this.paymentReversalForm.reason) {
      return;
    }

    const reversalDto: PaymentReversalDTO = {
      paymentId: this.paymentReversalForm.paymentId,
      reversalAmount: this.paymentReversalForm.reversalAmount,
      reason: this.paymentReversalForm.reason,
      notes: this.paymentReversalForm.notes
    };

    this.invoiceService.reversePayment(this.invoice.id, reversalDto).subscribe({
      next: () => {
        this.closePaymentReversalDialog();
        this.loadPaymentReversals(this.invoice!.id);
        this.loadInvoice(this.invoice!.id);
        this.loadAuditTrail(this.invoice!.id);
        alert('Pagamento revertido com sucesso');
      },
      error: (error) => {
        console.error('Error reversing payment:', error);
        alert('Erro ao reverter pagamento: ' + (error.error?.message || 'tente novamente'));
      }
    });
  }

  // ==================== VOID OPERATIONS ====================

  openVoidDialog(): void {
    this.showActionMenu = false;
    if (!confirm('Anular esta fatura? Ela será preservada no histórico mas não será mais cobrável.')) {
      return;
    }
    this.voidForm = {
      reason: '',
      notes: ''
    };
    this.showVoidDialog = true;
  }

  closeVoidDialog(): void {
    this.showVoidDialog = false;
  }

  submitVoid(): void {
    if (!this.invoice || !this.voidForm.reason) return;

    const voidDto: VoidInvoiceDTO = {
      reason: this.voidForm.reason,
      notes: this.voidForm.notes
    };

    this.invoiceService.voidInvoice(this.invoice.id, voidDto).subscribe({
      next: () => {
        this.closeVoidDialog();
        this.loadInvoice(this.invoice!.id);
        this.loadAuditTrail(this.invoice!.id);
        alert('Fatura anulada com sucesso');
      },
      error: (error) => {
        console.error('Error voiding invoice:', error);
        alert('Erro ao anular fatura: ' + (error.error?.message || 'tente novamente'));
      }
    });
  }

  deleteDraftInvoice(): void {
    if (this.invoice?.status !== 'DRAFT') {
      alert('Apenas faturas em rascunho podem ser deletadas');
      return;
    }

    if (!confirm('Deletar este rascunho? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.invoiceService.deleteDraftInvoice(this.invoice.id).subscribe({
      next: () => {
        alert('Rascunho deletado com sucesso');
        this.invoice = undefined;
      },
      error: (error) => {
        console.error('Error deleting draft invoice:', error);
        alert('Erro ao deletar rascunho: ' + (error.error?.message || 'tente novamente'));
      }
    });
  }
}
