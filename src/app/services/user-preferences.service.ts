import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly themeStorageKey = 'myproperty.themeMode';
  private readonly systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  readonly themeMode = signal<ThemeMode>(this.loadThemeMode());
  private readonly systemPrefersDark = signal<boolean>(this.systemMediaQuery.matches);

  readonly darkMode = computed<boolean>(() => {
    const mode = this.themeMode();
    if (mode === 'dark') {
      return true;
    }
    if (mode === 'light') {
      return false;
    }
    return this.systemPrefersDark();
  });

  constructor() {
    this.systemMediaQuery.addEventListener('change', (event: MediaQueryListEvent) => {
      this.systemPrefersDark.set(event.matches);
    });

    effect(() => {
      localStorage.setItem(this.themeStorageKey, this.themeMode());
    });

    effect(() => {
      document.documentElement.classList.toggle('dark', this.darkMode());
    });
  }

  setThemeMode(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  toggleDarkMode(): void {
    this.themeMode.set(this.darkMode() ? 'light' : 'dark');
  }

  private loadThemeMode(): ThemeMode {
    const stored = localStorage.getItem(this.themeStorageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }
}

