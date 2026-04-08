import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  template: '<p class="text-xs text-slate-500">Portfolio / Property / {{ label }}</p>'
})
export class BreadcrumbsComponent {
  @Input() label = '';
}

