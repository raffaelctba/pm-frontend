import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart',
  standalone: false,
  template: '<div class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">{{ title }}</div>'
})
export class ChartComponent {
  @Input() title = 'Chart placeholder';
}


