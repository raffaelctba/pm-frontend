# Payments Module

`src/app/payments` contains provider-aware checkout flows.

## Public Exports
- Root barrel: `src/app/payments/index.ts`
- Components: `PaymentCheckoutComponent`
- Services: `PaymentService`
- Models: payment request/response and method types

## UI Flows
- PIX: shows QR/copy code from gateway external reference
- Card: card form UX + gateway orchestration via backend abstraction
- Bank transfer: displays transfer instructions from provider response

## Backend Contract
- `POST /api/payments/invoices/{invoiceId}/process`
- Response supports `gatewayProvider`, `externalReference`, and `providerInstructions` for provider-specific UI rendering

