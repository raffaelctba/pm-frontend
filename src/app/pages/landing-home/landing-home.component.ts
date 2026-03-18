import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-8 shadow-sm md:p-12">
      <div class="pointer-events-none absolute -top-16 -right-20 h-56 w-56 rounded-full bg-primary-200/40 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl"></div>

      <div class="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
            Smart Property Management
          </p>

          <h2 class="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
            Operate your real estate business with confidence
          </h2>

          <p class="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            MyProperty centralizes portfolio management, billing, and tenant communication into one secure platform so your team can move faster and stay in control.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <button (click)="login()" class="btn btn-primary">Login</button>
            <a routerLink="/signup" class="btn btn-secondary">Sign Up</a>
          </div>

          <div class="mt-8 grid grid-cols-3 gap-3">
            <div class="rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p class="text-xl font-bold text-slate-900">250+</p>
              <p class="text-xs text-slate-600">Properties managed</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p class="text-xl font-bold text-slate-900">99.9%</p>
              <p class="text-xs text-slate-600">Platform availability</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p class="text-xl font-bold text-slate-900">24/7</p>
              <p class="text-xs text-slate-600">Team collaboration</p>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-900">Portfolio Overview</h3>
              <span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Live</span>
            </div>

            <div class="space-y-3">
              <div class="rounded-lg border border-slate-200 p-3">
                <div class="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Occupancy</span>
                  <span>84%</span>
                </div>
                <div class="h-2 rounded-full bg-slate-100">
                  <div class="h-2 w-[84%] rounded-full bg-primary-500"></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-lg border border-slate-200 p-3">
                  <p class="text-xs text-slate-500">Open invoices</p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">18</p>
                </div>
                <div class="rounded-lg border border-slate-200 p-3">
                  <p class="text-xs text-slate-500">Pending tickets</p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">6</p>
                </div>
              </div>

              <div class="rounded-lg border border-slate-200 p-3">
                <p class="text-xs text-slate-500">Message response time</p>
                <p class="mt-1 text-lg font-semibold text-slate-900">Under 2 hours</p>
              </div>
            </div>
          </div>

          <div class="absolute -right-3 -bottom-4 w-28 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <p class="text-xs text-slate-500">Cash flow</p>
            <p class="text-sm font-semibold text-emerald-700">+12.4%</p>
            <svg viewBox="0 0 120 40" class="mt-2 h-8 w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 30C18 31 22 11 39 12C56 13 59 31 76 28C92 25 101 14 118 8" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <article class="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z" stroke="currentColor" stroke-width="1.8"/>
            <path d="M9 21V12H15V21" stroke="currentColor" stroke-width="1.8"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900">Property Operations</h3>
        <p class="mt-2 text-sm text-slate-600">
          Organize portfolios, monitor occupancy, and keep all property records in one system.
        </p>
      </article>

      <article class="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <path d="M3 9H21" stroke="currentColor" stroke-width="1.8"/>
            <path d="M7 14H12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900">Billing and Invoices</h3>
        <p class="mt-2 text-sm text-slate-600">
          Track invoicing status and cash flow with clear financial visibility across properties.
        </p>
      </article>

      <article class="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.7239 20 9.50972 19.7646 8.40732 19.3408L4 21L5.48697 17.1238C4.55036 15.6018 4 13.8009 4 11.875C4 7.18058 8.02944 3.375 13 3.375C17.9706 3.375 22 7.18058 22 11.875" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 11.5H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M9 14.5H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900">Tenant Communication</h3>
        <p class="mt-2 text-sm text-slate-600">
          Respond faster with integrated messaging and keep a full conversation history.
        </p>
      </article>
    </section>
  `
})
export class LandingHomeComponent {
  constructor(private readonly authService: AuthService) {}

  login(): void {
    this.authService.login();
  }
}



