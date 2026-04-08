import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  template: '<button [type]="type" class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"><ng-content></ng-content></button>'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
}


