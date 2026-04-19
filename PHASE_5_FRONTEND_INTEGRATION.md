# Phase 5: Frontend Integration - Ready to Code

## 🎯 Overview

Phase 5 integrates the backend API endpoints with the frontend Angular component. The frontend component has already been enhanced with UI sections and dialogs. Now we need to implement the service methods.

---

## 📋 IMPLEMENTATION TASKS

### Task 1: Implement InvoiceService Methods (11 methods)

**File:** `frontend/src/app/services/invoice.service.ts`

#### Line Items Methods (4)

```typescript
// Add line item to draft invoice
addLineItem(invoiceId: number, itemDto: InvoiceLineItemDTO): Observable<InvoiceLineItem> {
  return this.http.post<InvoiceLineItem>(`${this.apiUrl}/invoices/${invoiceId}/line-items`, itemDto);
}

// Update line item in draft invoice
updateLineItem(invoiceId: number, itemId: number, itemDto: InvoiceLineItemDTO): Observable<InvoiceLineItem> {
  return this.http.put<InvoiceLineItem>(`${this.apiUrl}/invoices/${invoiceId}/line-items/${itemId}`, itemDto);
}

// Delete line item from draft invoice
deleteLineItem(invoiceId: number, itemId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/invoices/${invoiceId}/line-items/${itemId}`);
}

// Get all line items for invoice
getLineItems(invoiceId: number): Observable<InvoiceLineItem[]> {
  return this.http.get<InvoiceLineItem[]>(`${this.apiUrl}/invoices/${invoiceId}/line-items`);
}
```

#### Delivery Methods (3)

```typescript
// Send invoice to recipient
sendInvoice(invoiceId: number, sendDto: SendInvoiceDTO): Observable<InvoiceDelivery> {
  return this.http.post<InvoiceDelivery>(`${this.apiUrl}/invoices/${invoiceId}/send`, sendDto);
}

// Get delivery history for invoice
getDeliveryHistory(invoiceId: number): Observable<InvoiceDelivery[]> {
  return this.http.get<InvoiceDelivery[]>(`${this.apiUrl}/invoices/${invoiceId}/deliveries`);
}

// Mark delivery as viewed
markDeliveryAsViewed(invoiceId: number, deliveryId: number): Observable<InvoiceDelivery> {
  return this.http.put<InvoiceDelivery>(`${this.apiUrl}/invoices/${invoiceId}/deliveries/${deliveryId}/viewed`, {});
}
```

#### Payment Reversal Methods (2)

```typescript
// Reverse a payment
reversePayment(invoiceId: number, reversalDto: PaymentReversalDTO): Observable<PaymentReversal> {
  return this.http.post<PaymentReversal>(`${this.apiUrl}/invoices/${invoiceId}/reverse-payment`, reversalDto);
}

// Get payment reversals for invoice
getPaymentReversals(invoiceId: number): Observable<PaymentReversal[]> {
  return this.http.get<PaymentReversal[]>(`${this.apiUrl}/invoices/${invoiceId}/reversals`);
}
```

#### Void Methods (2)

```typescript
// Void an invoice
voidInvoice(invoiceId: number, voidDto: VoidInvoiceDTO): Observable<Invoice> {
  return this.http.post<Invoice>(`${this.apiUrl}/invoices/${invoiceId}/void`, voidDto);
}

// Delete draft invoice
deleteDraftInvoice(invoiceId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/invoices/${invoiceId}`);
}
```

---

### Task 2: Update Component Service Calls

**File:** `frontend/src/app/pages/invoices/invoice-detail/invoice-detail.component.ts`

Replace all TODO comments with actual service calls:

#### Line Items Service Calls

In `loadLineItems()`:
```typescript
loadLineItems(): void {
  if (!this.invoice) return;
  this.invoiceService.getLineItems(this.invoice.id).subscribe({
    next: (data) => {
      this.lineItems = data;
    },
    error: (error) => {
      console.error('Error loading line items:', error);
    }
  });
}
```

In `submitLineItem()`:
```typescript
submitLineItem(): void {
  if (!this.invoice || this.lineItemForm.unitPrice <= 0) return;

  if (this.editingLineItemId) {
    this.invoiceService.updateLineItem(this.invoice.id, this.editingLineItemId, this.lineItemForm)
        .subscribe({
          next: () => {
            this.closeLineItemDialog();
            this.loadLineItems();
            alert('Item atualizado com sucesso');
          },
          error: (error) => {
            console.error('Error updating line item:', error);
            alert('Erro ao atualizar item: ' + error.error?.message);
          }
        });
  } else {
    this.invoiceService.addLineItem(this.invoice.id, this.lineItemForm)
        .subscribe({
          next: () => {
            this.closeLineItemDialog();
            this.loadLineItems();
            alert('Item adicionado com sucesso');
          },
          error: (error) => {
            console.error('Error adding line item:', error);
            alert('Erro ao adicionar item: ' + error.error?.message);
          }
        });
  }
}
```

In `deleteLineItem()`:
```typescript
deleteLineItem(itemId?: number): void {
  if (!itemId || !confirm('Remover este item?')) return;
  
  this.invoiceService.deleteLineItem(this.invoice!.id, itemId)
      .subscribe({
        next: () => {
          this.loadLineItems();
          alert('Item removido com sucesso');
        },
        error: (error) => {
          console.error('Error deleting line item:', error);
          alert('Erro ao remover item: ' + error.error?.message);
        }
      });
}
```

#### Delivery Service Calls

In `loadDeliveryHistory()`:
```typescript
loadDeliveryHistory(): void {
  if (!this.invoice) return;
  this.invoiceService.getDeliveryHistory(this.invoice.id).subscribe({
    next: (data) => {
      this.deliveryHistory = data;
    },
    error: (error) => {
      console.error('Error loading delivery history:', error);
    }
  });
}
```

In `submitSendInvoice()`:
```typescript
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
      this.loadDeliveryHistory();
      this.loadInvoice(this.invoice!.id);
      alert('Fatura enviada com sucesso');
    },
    error: (error) => {
      console.error('Error sending invoice:', error);
      alert('Erro ao enviar fatura: ' + error.error?.message);
    }
  });
}
```

#### Payment Reversal Service Calls

In `loadPaymentReversals()`:
```typescript
loadPaymentReversals(): void {
  if (!this.invoice) return;
  this.invoiceService.getPaymentReversals(this.invoice.id).subscribe({
    next: (data) => {
      this.paymentReversals = data;
    },
    error: (error) => {
      console.error('Error loading payment reversals:', error);
    }
  });
}
```

In `submitPaymentReversal()`:
```typescript
submitPaymentReversal(): void {
  if (!this.invoice || this.paymentReversalForm.reversalAmount <= 0 || !this.paymentReversalForm.reason) {
    return;
  }

  const reversalDto: PaymentReversalDTO = {
    reversalAmount: this.paymentReversalForm.reversalAmount,
    reason: this.paymentReversalForm.reason,
    notes: this.paymentReversalForm.notes
  };

  this.invoiceService.reversePayment(this.invoice.id, reversalDto).subscribe({
    next: () => {
      this.closePaymentReversalDialog();
      this.loadPaymentReversals();
      this.loadInvoice(this.invoice!.id);
      alert('Pagamento revertido com sucesso');
    },
    error: (error) => {
      console.error('Error reversing payment:', error);
      alert('Erro ao reverter pagamento: ' + error.error?.message);
    }
  });
}
```

#### Void Service Calls

In `submitVoid()`:
```typescript
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
      alert('Erro ao anular fatura: ' + error.error?.message);
    }
  });
}
```

In `deleteDraftInvoice()`:
```typescript
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
      // Navigate back to invoices list
      // this.router.navigate(['/invoices']);
    },
    error: (error) => {
      console.error('Error deleting draft invoice:', error);
      alert('Erro ao deletar rascunho: ' + error.error?.message);
    }
  });
}
```

---

### Task 3: Update Component Initialization

In `ngOnInit()`, all data loading is already implemented:
```typescript
ngOnInit(): void {
  this.route.params.subscribe(params => {
    const id = +params['id'];
    this.loadInvoice(id);
    this.loadAuditTrail(id);
    this.loadLineItems();           // ✅ Already calls service
    this.loadDeliveryHistory();      // ✅ Already calls service
    this.loadPaymentReversals();     // ✅ Already calls service
  });
}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Service Methods
- [ ] `addLineItem()` - POST request
- [ ] `updateLineItem()` - PUT request
- [ ] `deleteLineItem()` - DELETE request
- [ ] `getLineItems()` - GET request
- [ ] `sendInvoice()` - POST request
- [ ] `getDeliveryHistory()` - GET request
- [ ] `markDeliveryAsViewed()` - PUT request
- [ ] `reversePayment()` - POST request
- [ ] `getPaymentReversals()` - GET request
- [ ] `voidInvoice()` - POST request
- [ ] `deleteDraftInvoice()` - DELETE request

### Component Integration
- [ ] Replace TODO in `loadLineItems()`
- [ ] Replace TODO in `submitLineItem()`
- [ ] Replace TODO in `deleteLineItem()`
- [ ] Replace TODO in `loadDeliveryHistory()`
- [ ] Replace TODO in `submitSendInvoice()`
- [ ] Replace TODO in `loadPaymentReversals()`
- [ ] Replace TODO in `submitPaymentReversal()`
- [ ] Replace TODO in `submitVoid()`
- [ ] Replace TODO in `deleteDraftInvoice()`

### Testing
- [ ] Component compiles without errors
- [ ] All service methods callable
- [ ] Error handling working
- [ ] Loading states working
- [ ] API calls successful
- [ ] UI updates correctly
- [ ] Form validation working

---

## 🧪 TESTING WORKFLOW

### 1. Test Line Items

```typescript
// In component
openAddLineItemDialog(); // Opens dialog
// User fills form
submitLineItem(); // Calls service.addLineItem()
// Service calls: POST /api/invoices/1/line-items
// Response: InvoiceLineItem created
// UI: Dialog closes, list refreshes
```

### 2. Test Delivery

```typescript
// User clicks "Enviar Fatura"
openSendInvoiceDialog(); // Opens dialog
// User selects method, enters email
submitSendInvoice(); // Calls service.sendInvoice()
// Service calls: POST /api/invoices/1/send
// Response: InvoiceDelivery created
// UI: Dialog closes, delivery history updates
```

### 3. Test Payment Reversal

```typescript
// In PAID invoice, click "Reverter Pagamento"
openPaymentReversalDialog(); // Opens dialog
// User enters amount and reason
submitPaymentReversal(); // Calls service.reversePayment()
// Service calls: POST /api/invoices/1/reverse-payment
// Response: PaymentReversal created
// UI: Dialog closes, reversals list updates, invoice reloaded
```

### 4. Test Void Invoice

```typescript
// In PENDING invoice, click "Anular Fatura"
openVoidDialog(); // Opens dialog
// User confirms and enters reason
submitVoid(); // Calls service.voidInvoice()
// Service calls: POST /api/invoices/1/void
// Response: Invoice status = VOIDED
// UI: Dialog closes, invoice reloaded
```

---

## 🎨 UI/UX CONSIDERATIONS

### Loading States
- Show spinner while calling API
- Disable buttons during API calls
- Show success/error toasts

### Error Handling
- Catch all errors from service
- Display user-friendly messages
- Log errors to console
- Retry option for failed calls

### Data Refresh
- Reload affected data after operations
- Update invoice status if changed
- Refresh related lists

---

## 📝 ERROR MESSAGES

| Scenario | Message |
|----------|---------|
| Validation Error | "Preencha todos os campos obrigatórios" |
| Network Error | "Erro de conexão. Tente novamente" |
| Server Error | "Erro do servidor. Tente mais tarde" |
| Line Item Error | "Erro ao adicionar item: [error message]" |
| Delivery Error | "Erro ao enviar fatura: [error message]" |
| Reversal Error | "Erro ao reverter pagamento: [error message]" |
| Void Error | "Erro ao anular fatura: [error message]" |

---

## ⏱️ ESTIMATED EFFORT

- Implement 11 service methods: 2-3 hours
- Update component calls: 2-3 hours
- Test functionality: 2-3 hours
- Fix bugs and edge cases: 1-2 hours
- **Total: 7-11 hours**

---

## 📋 DELIVERABLES

After Phase 5:
✅ All service methods implemented
✅ All component calls working
✅ Full frontend-backend integration
✅ Complete workflow tested
✅ Ready for UAT

---

## 🎯 SUCCESS CRITERIA

- [ ] All 11 service methods implemented
- [ ] Component calls replaced (all TODOs gone)
- [ ] No compilation errors
- [ ] All API calls work correctly
- [ ] Error handling working
- [ ] UI updates correctly
- [ ] Complete workflow testable
- [ ] No console errors during testing

---

## 🚀 NEXT PHASE

After Phase 5 complete:
- Phase 6: Testing & QA
- Phase 7: Deployment

---

**Phase 5: Frontend Integration**
**Status: Ready to Implement**
**Estimated Effort: 7-11 hours**

Let's integrate the frontend with the backend APIs!

