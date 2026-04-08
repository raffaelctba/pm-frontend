import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: false,
  template: '<div class="space-y-4"><ng-content></ng-content></div>'
})
export class TabsComponent {}


