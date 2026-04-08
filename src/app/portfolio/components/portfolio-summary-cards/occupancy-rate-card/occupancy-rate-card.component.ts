import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-occupancy-rate-card',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">Occupancy rate</p><p class="text-2xl font-bold text-slate-900">{{ value }}%</p></div>'
})
export class OccupancyRateCardComponent {
  @Input() value = 0;
}

