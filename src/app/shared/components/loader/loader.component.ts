import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: false,
  template: '<p class="text-sm text-slate-500">{{ text }}</p>'
})
export class LoaderComponent {
  @Input() text = 'Loading...';
}


