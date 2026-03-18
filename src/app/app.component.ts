import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <a routerLink="/" class="text-2xl font-bold text-primary-600">MyProperty</a>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a routerLink="/" routerLinkActive="border-primary-500 text-gray-900"
                   [routerLinkActiveOptions]="{ exact: true }"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <ng-container *ngIf="authService.isLoggedIn()">
                <a routerLink="/dashboard" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a routerLink="/properties" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Propriedades
                </a>
                <a routerLink="/invoices" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Faturas
                </a>
                <a routerLink="/chat" routerLinkActive="border-primary-500 text-gray-900"
                   class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Chat
                </a>
                </ng-container>
              </div>
            </div>
            <div class="flex items-center gap-3" *ngIf="authService.isLoggedIn(); else guestActions">
              <span class="text-gray-700 mr-4">{{ authService.getUsername() }}</span>
              <button (click)="logout()" class="btn btn-secondary">
                Sair
              </button>
            </div>
            <ng-template #guestActions>
              <div class="flex items-center gap-3">
                <button (click)="login()" class="btn btn-secondary">Login</button>
                <a routerLink="/signup" class="btn btn-primary">Sign Up</a>
              </div>
            </ng-template>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

  login(): void {
    this.authService.login();
  }
}
