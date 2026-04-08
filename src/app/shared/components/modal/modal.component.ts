import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: false,
  template: '<div *ngIf="open" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"><ng-content></ng-content></div>'
})
export class ModalComponent {
  @Input() open = false;
}


