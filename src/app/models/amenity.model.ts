export interface Amenity {
  id?: number;
  propertyId: number;
  name: string;
  description?: string;
  maxCapacity?: number;
  bookingFee: number;
  currencyCode: string;
  requiresApproval: boolean;
  bookingDurationMinutes: number;
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  openingTime?: string; // HH:mm format
  closingTime?: string;
  isActive: boolean;
  imageUrl?: string;
  rules?: string;
  cancellationPolicy?: string;
  maxReservationsPerTenantPerWeek?: number;
  minReservationDurationMinutes?: number;
  maxReservationDurationMinutes?: number;
  blackoutDates?: string;
  approvalThresholdAmount?: number;
  paymentProvider?: 'MANUAL' | 'STRIPE';
}

export interface AmenityBooking {
  id?: number;
  amenityId: number;
  userId?: number;
  bookingNumber?: string;
  startTime: string; // ISO datetime
  endTime: string;
  status: BookingStatus;
  numberOfGuests?: number;
  bookingFee: number;
  currencyCode: string;
  isPaid: boolean;
  paymentDate?: string;
  paymentProvider?: 'MANUAL' | 'STRIPE';
  paymentReference?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledById?: number;
  approvedAt?: string;
  approvedById?: number;
  adminOverride?: boolean;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface AmenityAvailability {
  amenityId: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface TimeSlot {
  startTime: string; // ISO datetime
  endTime: string;
}

export interface AmenityMaintenanceBlock {
  id?: number;
  amenityId: number;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  recurring?: boolean;
  recurrenceDayOfWeek?: number;
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
  recurrenceStartTime?: string;
  recurrenceEndTime?: string;
}

