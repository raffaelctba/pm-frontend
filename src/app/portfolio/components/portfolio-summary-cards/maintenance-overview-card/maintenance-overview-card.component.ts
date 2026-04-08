import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-maintenance-overview-card',
  standalone: true,
  template: '<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">Maintenance overview</p><p class="text-2xl font-bold text-slate-900">{{ openRequests }}</p></div>'
})
export class MaintenanceOverviewCardComponent {
  @Input() openRequests = 0;
}

