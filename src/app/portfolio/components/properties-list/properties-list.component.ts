import { Component, Input } from '@angular/core';
import { PortfolioPropertyCardVm } from '../../../shared/models/portfolio-dashboard.model';

@Component({
  selector: 'app-properties-list',
  standalone: false,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-slate-900">Properties</h2>
      <div class="space-y-3" *ngIf="properties.length; else emptyState">
        <app-property-card *ngFor="let property of properties" [property]="property"></app-property-card>
      </div>
      <ng-template #emptyState>
        <p class="text-sm text-slate-500">No properties found.</p>
      </ng-template>
    </div>
  `
})
export class PropertiesListComponent {
  @Input() properties: PortfolioPropertyCardVm[] = [];
}




