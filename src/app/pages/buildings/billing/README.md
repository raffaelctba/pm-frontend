# Phase 14 Billing UI (MVP)

This folder contains the Phase 14 billing UI pages wired to Phase 13 billing services.

## Pages

- `billing-dashboard.component.ts`
- `charge-management.component.ts`
- `billing-statement.component.ts`
- `payment-entry.component.ts`
- `approval-queue.component.ts`
- `reconciliation.component.ts`

## Routes

Under `property/:id`:

- `/billing`
- `/billing/charges`
- `/billing/statements`
- `/billing/payments`
- `/billing/approvals`
- `/billing/reconciliation`

## Data Integration

These pages use services from `src/app/services/billing/`:

- `ChargeTypeService`
- `ChargeService`
- `BillingStatementService`
- `PaymentService`
- `BillingManagementService`

## Quick Try

```powershell
cd C:\Projects\MyProperty\frontend
ng build --configuration development
ng serve --port 4200
```

Then open:

- `http://localhost:4200/property/{propertyId}/billing`

## Notes

- This is an MVP pass for Phase 14 focused on functionality and route wiring.
- Labels are wired to i18n keys in `src/app/services/i18n.service.ts` (EN/PT/FR/ES).
- API behavior depends on backend billing endpoints from Phase 12.
- Component tests exist for all six billing pages (`*.component.spec.ts`).


