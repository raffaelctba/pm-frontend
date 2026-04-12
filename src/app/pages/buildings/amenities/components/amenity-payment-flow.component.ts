import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AmenityBooking } from '../../../../models/amenity.model';

@Component({
  selector: 'app-amenity-payment-flow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-slate-900">Payment flow</h3>
      @if (!booking) {
        <p class="mt-2 text-xs text-slate-500">Select a reservation to manage payment.</p>
      } @else {
        <p class="mt-2 text-sm text-slate-700">{{ booking.bookingFee }} {{ booking.currencyCode }} · {{ booking.isPaid ? 'Paid' : 'Pending payment' }}</p>
        <div class="mt-3 flex gap-2">
          <button
            type="button"
            class="rounded border border-slate-300 px-2 py-1 text-xs"
            (click)="markManualPaid.emit(booking)"
            [disabled]="booking.isPaid"
          >
            Mark paid (manual)
          </button>
        </div>
      }
    </div>
  `
})
export class AmenityPaymentFlowComponent {
  @Input() booking: AmenityBooking | null = null;
  @Output() markManualPaid = new EventEmitter<AmenityBooking>();
}

