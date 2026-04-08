import { Component } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: false,
  template: '<div class="overflow-x-auto"><table class="min-w-full text-sm"><ng-content></ng-content></table></div>'
})
export class TableComponent {}


