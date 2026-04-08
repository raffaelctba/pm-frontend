import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-monthly-income-card',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">Monthly income</p><p class="text-lg font-semibold text-slate-900">{{ value }}</p></div>'
})
export class MonthlyIncomeCardComponent {
  @Input() value = '-';
}

