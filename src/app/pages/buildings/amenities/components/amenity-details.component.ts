import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Amenity, AmenityMaintenanceBlock } from '../../../../models/amenity.model';

@Component({
  selector: 'app-amenity-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      @if (amenity) {
        <h3 class="text-lg font-semibold text-slate-900">{{ amenity.name }}</h3>
        <p class="mt-1 text-sm text-slate-600">{{ amenity.description || '-' }}</p>

        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <p><span class="font-medium">Capacity:</span> {{ amenity.maxCapacity || '-' }}</p>
          <p><span class="font-medium">Hours:</span> {{ amenity.openingTime || '-' }} - {{ amenity.closingTime || '-' }}</p>
          <p><span class="font-medium">Fee:</span> {{ amenity.bookingFee }} {{ amenity.currencyCode }}</p>
          <p><span class="font-medium">Approval:</span> {{ amenity.requiresApproval ? 'Required' : 'Auto' }}</p>
        </div>

        <div class="mt-4">
          <h4 class="text-sm font-semibold text-slate-900">Maintenance blocks</h4>
          <div class="mt-2 space-y-2">
            @for (block of maintenanceBlocks; track block.id) {
              <div class="rounded border border-slate-200 px-3 py-2 text-xs text-slate-700">
                <p class="font-medium">{{ block.title }}</p>
                <p>{{ block.startTime || '-' }} - {{ block.endTime || '-' }}</p>
              </div>
            }
          </div>
          <button type="button" class="mt-2 rounded border border-slate-300 px-2 py-1 text-xs" (click)="newMaintenance.emit()">Add maintenance block</button>
        </div>
      } @else {
        <p class="text-sm text-slate-500">Select an amenity to view details.</p>
      }
    </div>
  `
})
export class AmenityDetailsComponent {
  @Input() amenity: Amenity | null = null;
  @Input() maintenanceBlocks: AmenityMaintenanceBlock[] = [];

  @Output() newMaintenance = new EventEmitter<void>();
}


