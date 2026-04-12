import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Amenity } from '../../../../models/amenity.model';

@Component({
  selector: 'app-amenity-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900">Amenities</h3>
        <button type="button" class="rounded-md bg-slate-900 px-3 py-1 text-xs text-white" (click)="create.emit()">New</button>
      </div>
      <div class="space-y-2">
        @for (amenity of amenities; track amenity.id) {
          <button
            type="button"
            class="w-full rounded-lg border px-3 py-2 text-left"
            [ngClass]="amenity.id === selectedAmenityId ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white'"
            (click)="select.emit(amenity)"
          >
            <p class="text-sm font-medium text-slate-900">{{ amenity.name }}</p>
            <p class="text-xs text-slate-500">{{ amenity.description || '-' }}</p>
          </button>
        }
      </div>
    </div>
  `
})
export class AmenityListComponent {
  @Input() amenities: Amenity[] = [];
  @Input() selectedAmenityId: number | null = null;

  @Output() select = new EventEmitter<Amenity>();
  @Output() create = new EventEmitter<void>();
}


