import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: false,
  template: '<section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><ng-content></ng-content></section>'
})
export class CardComponent {}


