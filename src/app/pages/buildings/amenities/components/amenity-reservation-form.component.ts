import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Amenity, AmenityBooking, BookingStatus } from '../../../../models/amenity.model';

@Component({
  selector: 'app-amenity-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-slate-900">Reservation form</h3>
      @if (amenity) {
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <label class="text-xs text-slate-700">
            Start
            <input type="datetime-local" class="mt-1 w-full rounded border border-slate-300 px-2 py-1" formControlName="startTime" />
          </label>
          <label class="text-xs text-slate-700">
            End
            <input type="datetime-local" class="mt-1 w-full rounded border border-slate-300 px-2 py-1" formControlName="endTime" />
          </label>
          <label class="text-xs text-slate-700 md:col-span-2">
            Notes
            <input type="text" class="mt-1 w-full rounded border border-slate-300 px-2 py-1" formControlName="notes" />
          </label>
          <button type="submit" class="rounded bg-primary-600 px-3 py-2 text-xs font-medium text-white md:col-span-2" [disabled]="form.invalid">Reserve</button>
        </form>
      } @else {
        <p class="mt-2 text-xs text-slate-500">Select an amenity first.</p>
      }
    </div>
  `
})
export class AmenityReservationFormComponent {
  @Input() amenity: Amenity | null = null;
  @Output() reserve = new EventEmitter<AmenityBooking>();

  readonly form = new FormBuilder().nonNullable.group({
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    notes: ['']
  });

  submit(): void {
    if (!this.amenity || this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.reserve.emit({
      amenityId: this.amenity.id!,
      startTime: new Date(raw.startTime).toISOString(),
      endTime: new Date(raw.endTime).toISOString(),
      status: this.amenity.requiresApproval ? BookingStatus.PENDING : BookingStatus.CONFIRMED,
      bookingFee: this.amenity.bookingFee,
      currencyCode: this.amenity.currencyCode,
      isPaid: this.amenity.bookingFee === 0,
      notes: raw.notes
    });
  }
}


