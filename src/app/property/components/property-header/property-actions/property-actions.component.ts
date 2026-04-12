import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'app-property-actions',
  standalone: true,
  template: '<div class="flex gap-2 text-sm text-slate-600">{{ i18n.translate(\'property.placeholders.propertyActions\') }}</div>'
})
export class PropertyActionsComponent {
  readonly i18n = inject(I18nService);
}

