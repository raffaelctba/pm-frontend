import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../../services/i18n.service';

@Component({
  selector: 'app-create-maintenance-request-button',
  standalone: true,
  template: '<button class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">{{ i18n.translate(\'property.tabs.maintenance.createRequest\') }}</button>'
})
export class CreateMaintenanceRequestButtonComponent {
  readonly i18n = inject(I18nService);
}

