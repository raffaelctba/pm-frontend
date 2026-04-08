import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-total-properties-card',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">Total properties</p><p class="text-2xl font-bold text-slate-900">{{ value }}</p></div>'
})
export class TotalPropertiesCardComponent {
  @Input() value = 0;
}

