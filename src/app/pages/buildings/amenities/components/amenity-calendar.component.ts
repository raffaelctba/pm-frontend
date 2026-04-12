import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AmenityBooking } from '../../../../models/amenity.model';

@Component({
  selector: 'app-amenity-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-slate-900">Calendar view</h3>
      <div class="mt-3 space-y-2">
        @for (booking of bookings; track booking.id) {
          <div class="rounded-lg border border-slate-200 px-3 py-2 text-xs">
            <p class="font-medium text-slate-800">{{ booking.startTime | date:'short' }} - {{ booking.endTime | date:'shortTime' }}</p>
            <p class="text-slate-500">Status: {{ booking.status }}</p>
          </div>
        }
        @if (bookings.length === 0) {
          <p class="text-xs text-slate-500">No reservations yet.</p>
        }
      </div>
    </div>
  `
})
export class AmenityCalendarComponent {
  @Input() bookings: AmenityBooking[] = [];
}

