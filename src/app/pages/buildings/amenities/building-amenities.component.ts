import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Amenity, AmenityBooking, AmenityMaintenanceBlock, BookingStatus } from '../../../models/amenity.model';
import { AmenityService } from '../../../services/amenity.service';
import { AmenityBookingService } from '../../../services/amenity-booking.service';
import { AmenityMaintenanceBlockService } from '../../../services/amenity-maintenance-block.service';
import { AmenityListComponent } from './components/amenity-list.component';
import { AmenityDetailsComponent } from './components/amenity-details.component';
import { AmenityCalendarComponent } from './components/amenity-calendar.component';
import { AmenityReservationFormComponent } from './components/amenity-reservation-form.component';
import { AmenityPaymentFlowComponent } from './components/amenity-payment-flow.component';

@Component({
  selector: 'app-building-amenities',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AmenityListComponent,
    AmenityDetailsComponent,
    AmenityCalendarComponent,
    AmenityReservationFormComponent,
    AmenityPaymentFlowComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-7xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Building amenities</h1>
          <p class="text-sm text-slate-600">Manage amenities, maintenance blocks, reservations and payments.</p>
        </div>
        <a [routerLink]="['/property', propertyId()]" class="rounded border border-slate-300 px-3 py-2 text-sm">Back to property</a>
      </div>

      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div class="rounded border border-slate-200 bg-white p-3">
          <p class="text-xs text-slate-500">Total reservations</p>
          <p class="text-xl font-semibold text-slate-900">{{ analytics().totalReservations }}</p>
        </div>
        <div class="rounded border border-slate-200 bg-white p-3">
          <p class="text-xs text-slate-500">Pending</p>
          <p class="text-xl font-semibold text-amber-700">{{ analytics().pendingReservations }}</p>
        </div>
        <div class="rounded border border-slate-200 bg-white p-3">
          <p class="text-xs text-slate-500">Confirmed</p>
          <p class="text-xl font-semibold text-blue-700">{{ analytics().confirmedReservations }}</p>
        </div>
        <div class="rounded border border-slate-200 bg-white p-3">
          <p class="text-xs text-slate-500">Cancelled</p>
          <p class="text-xl font-semibold text-rose-700">{{ analytics().cancelledReservations }}</p>
        </div>
        <div class="rounded border border-slate-200 bg-white p-3">
          <p class="text-xs text-slate-500">Completed</p>
          <p class="text-xl font-semibold text-emerald-700">{{ analytics().completedReservations }}</p>
        </div>
      </div>

      @if (error()) {
        <p class="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error() }}</p>
      }

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div class="xl:col-span-3">
          <app-amenity-list
            [amenities]="amenities()"
            [selectedAmenityId]="selectedAmenity()?.id ?? null"
            (select)="selectAmenity($event)"
            (create)="createDefaultAmenity()"
          />
        </div>

        <div class="xl:col-span-5 space-y-4">
          <app-amenity-details
            [amenity]="selectedAmenity()"
            [maintenanceBlocks]="maintenanceBlocks()"
            (newMaintenance)="createDefaultMaintenanceBlock()"
          />
          <app-amenity-calendar [bookings]="bookings()" />
        </div>

        <div class="xl:col-span-4 space-y-4">
          <app-amenity-reservation-form [amenity]="selectedAmenity()" (reserve)="reserve($event)" />
          <app-amenity-payment-flow [booking]="selectedBooking()" (markManualPaid)="markPaid($event)" />

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <h3 class="text-sm font-semibold text-slate-900">Reservations</h3>
            <div class="mt-2 space-y-2">
              @for (booking of bookings(); track booking.id) {
                <button type="button" class="w-full rounded border border-slate-200 px-3 py-2 text-left" (click)="selectedBooking.set(booking)">
                  <p class="text-xs font-medium text-slate-800">{{ booking.startTime | date:'short' }}</p>
                  <p class="text-xs text-slate-500">{{ booking.status }} · {{ booking.bookingFee }} {{ booking.currencyCode }}</p>
                  <div class="mt-1 flex gap-2">
                    <button type="button" class="rounded border border-slate-300 px-2 py-0.5 text-[10px]" (click)="approve(booking); $event.stopPropagation()" [disabled]="booking.status !== BookingStatus.PENDING">Approve</button>
                    <button type="button" class="rounded border border-slate-300 px-2 py-0.5 text-[10px]" (click)="complete(booking); $event.stopPropagation()" [disabled]="booking.status !== BookingStatus.CONFIRMED">Complete</button>
                    <button type="button" class="rounded border border-rose-300 px-2 py-0.5 text-[10px] text-rose-700" (click)="cancel(booking); $event.stopPropagation()" [disabled]="booking.status === BookingStatus.CANCELLED">Cancel</button>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BuildingAmenitiesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly amenityService = inject(AmenityService);
  private readonly bookingService = inject(AmenityBookingService);
  private readonly maintenanceService = inject(AmenityMaintenanceBlockService);

  readonly BookingStatus = BookingStatus;

  readonly propertyId = signal<number>(0);
  readonly amenities = signal<Amenity[]>([]);
  readonly selectedAmenity = signal<Amenity | null>(null);
  readonly maintenanceBlocks = signal<AmenityMaintenanceBlock[]>([]);
  readonly bookings = signal<AmenityBooking[]>([]);
  readonly selectedBooking = signal<AmenityBooking | null>(null);
  readonly error = signal<string>('');
  readonly analytics = signal({
    propertyId: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    completedReservations: 0
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id')
      ?? this.route.snapshot.paramMap.get('buildingId')
      ?? this.route.parent?.snapshot.paramMap.get('buildingId')
      ?? this.route.parent?.snapshot.paramMap.get('id')
      ?? '0';
    this.propertyId.set(Number(rawId));
    this.loadAmenities();
    this.loadAnalytics();
  }

  loadAmenities(): void {
    this.amenityService.getActiveAmenities(this.propertyId()).subscribe({
      next: (amenities) => {
        this.amenities.set(amenities);
        if (amenities.length > 0) {
          this.selectAmenity(amenities[0]);
        }
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Could not load amenities.')
    });
  }

  loadAnalytics(): void {
    this.amenityService.getAmenitiesAnalytics(this.propertyId()).subscribe({
      next: (analytics) => this.analytics.set(analytics),
      error: () => {
        // keep default analytics when endpoint is unavailable
      }
    });
  }

  selectAmenity(amenity: Amenity): void {
    this.selectedAmenity.set(amenity);
    this.selectedBooking.set(null);
    this.maintenanceService.getByAmenity(amenity.id!).subscribe({
      next: (blocks) => this.maintenanceBlocks.set(blocks),
      error: () => this.maintenanceBlocks.set([])
    });
    this.bookingService.getAmenityBookings(amenity.id!, 0, 25).subscribe({
      next: (page) => this.bookings.set(page.content),
      error: () => this.bookings.set([])
    });
  }

  reserve(payload: AmenityBooking): void {
    const amenity = this.selectedAmenity();
    if (!amenity?.id) {
      return;
    }

    this.bookingService.createBooking(amenity.id, payload).subscribe({
      next: () => this.selectAmenity(amenity),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not create reservation.')
    });
  }

  markPaid(booking: AmenityBooking): void {
    if (!booking.id) {
      return;
    }
    this.bookingService.markAsPaid(booking.amenityId, booking.id).subscribe({
      next: () => this.reloadCurrentAmenity(),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not mark reservation as paid.')
    });
  }

  approve(booking: AmenityBooking): void {
    if (!booking.id) {
      return;
    }
    this.bookingService.approveBooking(booking.amenityId, booking.id).subscribe({
      next: () => this.reloadCurrentAmenity(),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not approve reservation.')
    });
  }

  complete(booking: AmenityBooking): void {
    if (!booking.id) {
      return;
    }
    this.bookingService.completeBooking(booking.amenityId, booking.id).subscribe({
      next: () => this.reloadCurrentAmenity(),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not complete reservation.')
    });
  }

  cancel(booking: AmenityBooking): void {
    if (!booking.id) {
      return;
    }
    this.bookingService.cancelBooking(booking.amenityId, booking.id, 'Cancelled by admin').subscribe({
      next: () => this.reloadCurrentAmenity(),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not cancel reservation.')
    });
  }

  createDefaultAmenity(): void {
    const payload: Amenity = {
      propertyId: this.propertyId(),
      name: `Amenity ${Date.now()}`,
      description: 'New amenity',
      maxCapacity: 10,
      bookingFee: 0,
      currencyCode: 'BRL',
      requiresApproval: false,
      bookingDurationMinutes: 60,
      minAdvanceBookingHours: 1,
      maxAdvanceBookingDays: 30,
      openingTime: '08:00',
      closingTime: '22:00',
      isActive: true,
      paymentProvider: 'MANUAL'
    };

    this.amenityService.createAmenity(this.propertyId(), payload).subscribe({
      next: () => this.loadAmenities(),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not create amenity.')
    });
  }

  createDefaultMaintenanceBlock(): void {
    const amenity = this.selectedAmenity();
    if (!amenity?.id) {
      return;
    }

    const now = new Date();
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const block: AmenityMaintenanceBlock = {
      amenityId: amenity.id,
      title: 'Routine maintenance',
      description: 'Auto-generated maintenance block',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      recurring: false
    };

    this.maintenanceService.create(amenity.id, block).subscribe({
      next: () => this.selectAmenity(amenity),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not create maintenance block.')
    });
  }

  private reloadCurrentAmenity(): void {
    const amenity = this.selectedAmenity();
    if (amenity) {
      this.selectAmenity(amenity);
      this.loadAnalytics();
    }
  }
}

