import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: false,
  template: '<span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{{ label }}</span>'
})
export class BadgeComponent {
  @Input() label = '';
}


