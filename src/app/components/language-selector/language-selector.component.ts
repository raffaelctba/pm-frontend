import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { LanguageCode } from '../../services/language-detection.util';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1">
      <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {{ translation.translate('nav.language') }}
      </label>
      <select
        class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        [value]="currentLanguage()"
        (change)="setLanguage(($any($event.target)).value)"
      >
        @for (lang of translation.supportedLanguages; track lang) {
          <option [value]="lang">{{ translation.translate('lang.' + lang) }}</option>
        }
      </select>
    </div>
  `
})
export class LanguageSelectorComponent {
  constructor(public readonly translation: TranslationService) {}

  currentLanguage(): LanguageCode {
    return this.translation.currentLanguage;
  }

  setLanguage(language: string): void {
    this.translation.setLanguage(language);
  }
}


