import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { I18nService, LanguageCode } from '../../services/i18n.service';
import { ThemeMode, UserPreferencesService } from '../../services/user-preferences.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" (click)="$event.stopPropagation()">
      <button type="button" class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" (click)="toggleMenu()">
        @if (avatarDataUrl()) {
          <img [src]="avatarDataUrl()!" alt="Profile" class="h-8 w-8 rounded-full object-cover border border-slate-200" />
        } @else {
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
            {{ initials() }}
          </span>
        }
        <span class="hidden md:block">{{ displayName() }}</span>
      </button>

      @if (menuOpen()) {
        <div class="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div class="border-b border-slate-200 pb-3">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('profile.title') }}</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">{{ displayName() }}</p>
            <p class="text-xs text-slate-600">{{ email() }}</p>
            <p class="text-xs text-slate-500">{{ username() }}</p>
          </div>

          <div class="mt-3 space-y-3">
            <div class="rounded-lg border border-slate-200 p-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('profile.title') }}</p>
              <input #avatarInput type="file" accept="image/*" class="hidden" (change)="onAvatarSelected($event)" />
              <div class="mt-2 flex gap-2">
                <button type="button" class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50" (click)="avatarInput.click()">
                  {{ t('profile.uploadPicture') }}
                </button>
                <button type="button" class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50" (click)="openAccountSettings()">
                  {{ t('profile.editInfo') }}
                </button>
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('profile.theme') }}</p>
              <div class="mt-2 flex gap-2">
                @for (mode of themeModes; track mode) {
                  <button
                    type="button"
                    class="rounded-md border px-2 py-1 text-xs"
                    [class.border-primary-600]="preferences.themeMode() === mode"
                    [class.text-primary-700]="preferences.themeMode() === mode"
                    [class.border-slate-300]="preferences.themeMode() !== mode"
                    [class.text-slate-600]="preferences.themeMode() !== mode"
                    (click)="setTheme(mode)"
                  >
                    {{ modeLabel(mode) }}
                  </button>
                }
              </div>
              <button type="button" class="mt-2 text-xs text-primary-700 hover:text-primary-800" (click)="preferences.toggleDarkMode()">
                {{ preferences.darkMode() ? t('profile.dark.disable') : t('profile.dark.enable') }}
              </button>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('nav.language') }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                @for (lang of i18n.supportedLanguages; track lang) {
                  <button
                    type="button"
                    class="rounded-md border px-2 py-1 text-xs"
                    [class.border-primary-600]="currentLanguage() === lang"
                    [class.text-primary-700]="currentLanguage() === lang"
                    [class.border-slate-300]="currentLanguage() !== lang"
                    [class.text-slate-600]="currentLanguage() !== lang"
                    (click)="setLanguage(lang)"
                  >
                    {{ t('lang.' + lang) }}
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="mt-4 border-t border-slate-200 pt-3">
            <button type="button" class="btn btn-secondary w-full" (click)="logout()">{{ t('nav.logout') }}</button>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileMenuComponent {
  private readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly preferences = inject(UserPreferencesService);
  readonly language = toSignal(this.i18n.language$, { initialValue: this.i18n.currentLanguage });
  private readonly avatarStorageKey = 'myproperty.profile.avatar';

  readonly menuOpen = signal<boolean>(false);
  readonly avatarDataUrl = signal<string | null>(this.loadStoredAvatar());
  readonly themeModes: ThemeMode[] = ['system', 'light', 'dark'];

  readonly profile = toSignal(
    this.authService.getUserProfile().pipe(catchError(() => of(null))),
    { initialValue: null }
  );

  constructor() {
    this.i18n.init();
  }

  @HostListener('document:click')
  closeMenuOnOutsideClick(): void {
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  setLanguage(language: LanguageCode): void {
    this.i18n.setLanguage(language);
  }

  setTheme(mode: ThemeMode): void {
    this.preferences.setThemeMode(mode);
  }

  logout(): void {
    this.authService.logout();
  }

  openAccountSettings(): void {
    const accountUrl = `${environment.keycloakUrl}/realms/${environment.keycloakRealm}/account`;
    window.open(accountUrl, '_blank', 'noopener,noreferrer');
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : null;
      if (!value) {
        return;
      }

      this.avatarDataUrl.set(value);
      localStorage.setItem(this.avatarStorageKey, value);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  displayName(): string {
    const profile = this.profile();
    const fullName = [profile?.firstName ?? '', profile?.lastName ?? ''].join(' ').trim();
    if (fullName) {
      return fullName;
    }
    return this.authService.getUsername() || 'User';
  }

  email(): string {
    return this.profile()?.email ?? '';
  }

  username(): string {
    return this.authService.getUsername();
  }

  initials(): string {
    const name = this.displayName().trim();
    if (!name) {
      return 'U';
    }
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'U';
    const second = parts.length > 1 ? parts[1].charAt(0) : '';
    return (first + second).toUpperCase();
  }

  modeLabel(mode: ThemeMode): string {
    if (mode === 'system') {
      return this.t('theme.system');
    }
    if (mode === 'light') {
      return this.t('theme.light');
    }
    return this.t('theme.dark');
  }

  t(key: string): string {
    this.language();
    return this.i18n.translate(key);
  }

  currentLanguage(): LanguageCode {
    return this.language();
  }

  private loadStoredAvatar(): string | null {
    return localStorage.getItem(this.avatarStorageKey);
  }
}


