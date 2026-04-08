import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-portfolio-header',
  standalone: false,
  template: `
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900">{{ title }}</h1>
      <p class="mt-1 text-sm text-slate-600">{{ subtitle }}</p>
    </div>
  `
})
export class PortfolioHeaderComponent {
  @Input() title = 'Portfolio Dashboard';
  @Input() subtitle = 'Global view across all owned properties.';
}


