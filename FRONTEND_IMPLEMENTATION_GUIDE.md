# Frontend Invoice Lifecycle Implementation Guide

## Overview
The frontend `invoice-detail.component.ts` has been enhanced to support the complete invoice lifecycle with the following new features:

## New Features Added

### 1. Line Items Management (Draft Only)
**UI Section**: "Itens da Fatura"
- Display all line items for an invoice
- Add new line items (Draft only)
- Edit existing line items (Draft only)
- Delete line items (Draft only)
- Auto-calculate totals with taxes and discounts

**Key Methods**:
- `loadLineItems()` - Load line items from service
- `openAddLineItemDialog()` - Open add dialog
- `editLineItem(item)` - Open edit dialog
- `submitLineItem()` - Submit add/update
- `deleteLineItem(itemId)` - Delete item

**Form Fields**:
- description* (required)
- itemCode (optional)
- quantity* (required, min 1)
- unitPrice* (required, min 0)
- taxPercentage (optional, %)
- discountPercentage (optional, %)

### 2. Delivery Status Tracking (Finalized Invoices)
**UI Section**: "Status de Entrega"
- Display current delivery status
- Show delivery method
- Track viewing status
- Show complete delivery history
- Retry failed deliveries

**Delivery Statuses**:
- NOT_SENT - Fatura não enviada
- SENT_EMAIL - Enviada por email
- SENT_PORTAL - Disponível no portal
- SENT_PRINT - Impressão realizada
- VIEWED - 👀 Visualizada
- FAILED - ❌ Falha na entrega

**Key Methods**:
- `loadDeliveryHistory()` - Load delivery records
- `openSendInvoiceDialog()` - Open send dialog
- `submitSendInvoice()` - Send invoice
- `getDeliveryStatusLabel(status)` - Format status

### 3. Payment Reversals (Paid/Partially Paid)
**UI Section**: "Reversões de Pagamento"
- Display all payment reversals
- Add new payment reversal
- Track reversal reason
- Show reversal amount and date

**Key Methods**:
- `loadPaymentReversals()` - Load reversals
- `canReversePayment()` - Check if reversible
- `openPaymentReversalDialog()` - Open reversal dialog
- `submitPaymentReversal()` - Submit reversal

**Form Fields**:
- reversalAmount* (required, > 0)
- reason* (required, text)
- notes (optional)

### 4. Void Operations (Non-Paid Invoices)
**UI Features**:
- Void invoice button (separate from reissue)
- Record void reason
- Confirmation before action
- Preserve original invoice

**Key Methods**:
- `openVoidDialog()` - Open void dialog
- `submitVoid()` - Submit void
- `deleteDraftInvoice()` - Delete draft

**Form Fields**:
- reason* (required)
- notes (optional)

### 5. Enhanced Action Menu
**New Actions**:
- 📧 Enviar Fatura (Send invoice)
- 💰 Criar Nota de Crédito (Create credit note)
- 📊 Criar Nota de Débito (Create debit note)
- ↩️ Reverter Pagamento (Reverse payment - if eligible)
- 🔄 Anular e Reemitir (Void and reissue)
- ❌ Anular Fatura (Void invoice)

---

## Component Data Structure

### New Properties

```typescript
// Data collections
lineItems: InvoiceLineItem[] = [];
deliveryHistory: InvoiceDelivery[] = [];
paymentReversals: PaymentReversal[] = [];

// Dialog visibility flags
showLineItemDialog = false;
showSendInvoiceDialog = false;
showPaymentReversalDialog = false;
showVoidDialog = false;

// Form objects
lineItemForm = { ... }
sendInvoiceForm = { ... }
paymentReversalForm = { ... }
voidForm = { ... }

// Editing state
editingLineItemId?: number;
```

---

## Dialog Components

### 1. Line Item Dialog
```
Title: Adicionar Item / Editar Item
Fields:
- Descrição* (text, required)
- Quantidade* (number, min 1)
- Valor Unitário* (number, min 0)
- Imposto (%) (number)
- Desconto (%) (number)
Buttons: Cancelar, Adicionar/Atualizar
```

### 2. Send Invoice Dialog
```
Title: Enviar Fatura
Fields:
- Método de Entrega* (select: EMAIL, PORTAL, PRINT)
- Email* (email, if EMAIL selected)
- Notas (textarea)
Buttons: Cancelar, Enviar
```

### 3. Payment Reversal Dialog
```
Title: Reverter Pagamento
Warning: ⚠️ Esta ação irá reverter o pagamento...
Fields:
- Valor a Reverter* (number, > 0)
- Motivo* (textarea, required)
- Notas (textarea)
Buttons: Cancelar, Reverter Pagamento
```

### 4. Void Invoice Dialog
```
Title: Anular Fatura
Warning: ⚠️ Esta ação irá anular a fatura...
Fields:
- Motivo* (textarea, required)
- Notas (textarea)
Buttons: Cancelar, Anular Fatura
```

---

## Template Sections Added

### 1. Action Menu Expansion
Added new action buttons:
- Send invoice
- Payment reversal (conditional)
- Void invoice
- Improved action menu organization

### 2. Line Items Section (Draft Only)
```html
<div *ngIf="invoice.status === 'DRAFT'">
  - Display list of line items
  - Add button
  - Edit/delete actions per item
  - Auto-calculated totals
</div>
```

### 3. Delivery Status Section (Finalized)
```html
<div *ngIf="isFinalized(invoice.status)">
  - Current delivery status
  - Send button (if NOT_SENT)
  - Delivery history timeline
  - Recipient email (if available)
  - Viewed status tracking
</div>
```

### 4. Payment Reversals Section (Paid/Partially Paid)
```html
<div *ngIf="canReversePayment()">
  - List of reversals
  - Reversal amount
  - Reason
  - Reversal date
  - Button to add reversal
</div>
```

---

## Integration Requirements

### 1. InvoiceService Methods to Implement

```typescript
// Line Items
addLineItem(invoiceId: number, itemDto: InvoiceLineItemDTO): Observable<InvoiceLineItem>
updateLineItem(invoiceId: number, itemId: number, itemDto: InvoiceLineItemDTO): Observable<InvoiceLineItem>
deleteLineItem(invoiceId: number, itemId: number): Observable<void>
getLineItems(invoiceId: number): Observable<InvoiceLineItem[]>

// Delivery
sendInvoice(invoiceId: number, sendDto: SendInvoiceDTO): Observable<InvoiceDelivery>
getDeliveryHistory(invoiceId: number): Observable<InvoiceDelivery[]>
markAsViewed(invoiceId: number, deliveryId: number): Observable<InvoiceDelivery>

// Payment Reversals
reversePayment(invoiceId: number, reversalDto: PaymentReversalDTO): Observable<PaymentReversal>
getPaymentReversals(invoiceId: number): Observable<PaymentReversal[]>

// Void Operations
voidInvoice(invoiceId: number, voidDto: VoidInvoiceDTO): Observable<Invoice>
deleteDraftInvoice(invoiceId: number): Observable<void>
```

### 2. API Endpoints to Create

```
POST   /api/invoices/{id}/line-items
PUT    /api/invoices/{id}/line-items/{itemId}
DELETE /api/invoices/{id}/line-items/{itemId}
GET    /api/invoices/{id}/line-items

POST   /api/invoices/{id}/send
GET    /api/invoices/{id}/deliveries
PUT    /api/invoices/{id}/deliveries/{deliveryId}/viewed

POST   /api/invoices/{id}/reverse-payment
GET    /api/invoices/{id}/reversals

POST   /api/invoices/{id}/void
DELETE /api/invoices/{id}
```

### 3. Models to Update

Enhanced models in `invoice-lifecycle.model.ts`:
- `InvoiceLineItem`
- `InvoiceDelivery`
- `InvoiceDeliveryStatus` (enum)
- `PaymentReversal`
- `SendInvoiceDTO`
- `PaymentReversalDTO`
- `VoidInvoiceDTO`
- `InvoiceLineItemDTO`

---

## Implementation Checklist

### Phase 1: Service Methods (TODO)
- [ ] Implement `addLineItem()`
- [ ] Implement `updateLineItem()`
- [ ] Implement `deleteLineItem()`
- [ ] Implement `getLineItems()`
- [ ] Implement `sendInvoice()`
- [ ] Implement `getDeliveryHistory()`
- [ ] Implement `markAsViewed()`
- [ ] Implement `reversePayment()`
- [ ] Implement `getPaymentReversals()`
- [ ] Implement `voidInvoice()`
- [ ] Implement `deleteDraftInvoice()`

### Phase 2: API Integration (TODO)
- [ ] Uncomment TODO service calls
- [ ] Add proper error handling
- [ ] Add loading states
- [ ] Add success messages
- [ ] Add error messages

### Phase 3: Testing (TODO)
- [ ] Test line item CRUD
- [ ] Test send invoice
- [ ] Test payment reversal
- [ ] Test void invoice
- [ ] Test draft deletion
- [ ] Test form validation
- [ ] Test error handling

### Phase 4: Styling (TODO)
- [ ] Review dialog styling
- [ ] Test responsive design
- [ ] Test on mobile devices
- [ ] Ensure accessibility
- [ ] Verify color contrast

---

## Current TODOs in Code

All service calls are marked with TODO comments:

1. **Line Items**
   - `loadLineItems()` - TODO: Call service
   - `submitLineItem()` - TODO: Call add/update service
   - `deleteLineItem()` - TODO: Call delete service

2. **Delivery**
   - `loadDeliveryHistory()` - TODO: Call service
   - `submitSendInvoice()` - TODO: Call send service

3. **Payment Reversals**
   - `loadPaymentReversals()` - TODO: Call service
   - `submitPaymentReversal()` - TODO: Call reversal service

4. **Void**
   - `submitVoid()` - TODO: Call void service
   - `deleteDraftInvoice()` - TODO: Call delete service

---

## State Management

### Dialog States
```typescript
showLineItemDialog = false;        // Line item add/edit
showSendInvoiceDialog = false;     // Send invoice
showPaymentReversalDialog = false; // Payment reversal
showVoidDialog = false;            // Void invoice
```

### Data States
```typescript
lineItems: InvoiceLineItem[] = [];      // Current line items
deliveryHistory: InvoiceDelivery[] = [];     // Delivery history
paymentReversals: PaymentReversal[] = [];   // Reversal history
```

### Editing State
```typescript
editingLineItemId?: number;  // Which item is being edited
```

---

## Conditional Rendering

### Line Items Section
- Only shown when `invoice.status === 'DRAFT'`
- Add button visible when in Draft
- Edit/delete actions visible when in Draft

### Delivery Section
- Only shown when `isFinalized(invoice.status)` is true
- Send button visible when `deliveryStatus === 'NOT_SENT'`
- History always visible for finalized

### Payment Reversals
- Only shown when `canReversePayment()` returns true
- Button visible only for PAID and PARTIALLY_PAID

### Void Button
- Only in action menu
- Should disable if invoice has payments

---

## Validation Rules

### Line Item Form
- Description: Required, string
- Quantity: Required, min 1
- Unit Price: Required, min 0.01
- Tax %: Optional, min 0
- Discount %: Optional, min 0

### Send Invoice Form
- Delivery Method: Required, select
- Email: Required if EMAIL method, valid email format
- Notes: Optional

### Payment Reversal Form
- Reversal Amount: Required, > 0, ≤ payment amount
- Reason: Required, string
- Notes: Optional

### Void Form
- Reason: Required, string
- Notes: Optional

---

## Error Handling

Current component uses:
- `confirm()` for confirmations
- `alert()` for messages
- `console.log()` for debugging

**To implement**:
- Toast notifications for success
- Toast notifications for errors
- Loading spinners
- Error messages in UI

---

## Performance Considerations

1. **Lazy Loading**: Line items, deliveries, and reversals only loaded when needed
2. **Pagination**: Consider paginating delivery history and reversals
3. **Caching**: Cache line items during session
4. **Debouncing**: Debounce form input validation

---

## Accessibility Features

- Form labels properly associated
- Required fields marked with *
- Color not only differentiator (icons used)
- Keyboard navigation support
- ARIA labels where appropriate

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- No IE11 support

---

## Dependencies

- Angular 15+
- TypeScript 4.8+
- Tailwind CSS (for styling)
- Common module (for *ngIf, *ngFor)
- Forms module (for NgModel)

---

## File Locations

- **Component**: `frontend/src/app/pages/invoices/invoice-detail/invoice-detail.component.ts`
- **Models**: `frontend/src/app/models/invoice-lifecycle.model.ts`
- **Service**: `frontend/src/app/services/invoice.service.ts` (to update)

---

## Next Steps

1. **Implement Service Methods**: Add all TODO service methods to InvoiceService
2. **Create API Endpoints**: Implement backend endpoints (already designed)
3. **Test Component**: Unit test all methods
4. **Test Integration**: E2E tests for complete workflows
5. **Deploy**: Staged deployment to test/staging/production

---

**Status**: Component template and logic complete
**Next**: Implement service methods and API endpoints
**Estimated Effort**: 20-30 hours for complete implementation

