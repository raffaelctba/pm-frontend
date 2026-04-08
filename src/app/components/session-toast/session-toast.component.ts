import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { SessionNotificationService } from '../../services/session-notification.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-session-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastSlideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ],
  template: `
    @if (sessionNotification.visible()) {
      <div class="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4" [@toastSlideFade]>
        <div class="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg">
          {{ i18n.translate(sessionNotification.messageKey()) }}
        </div>
      </div>
    }
  `
})
export class SessionToastComponent {
  readonly sessionNotification = inject(SessionNotificationService);
  readonly i18n = inject(I18nService);
}

