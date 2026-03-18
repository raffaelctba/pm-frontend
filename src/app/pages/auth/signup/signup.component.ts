import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 class="text-2xl font-bold text-slate-900">Create your account</h2>
      <p class="mt-2 text-sm text-slate-600">
        Register with MyProperty to access property operations, invoicing and tenant communication tools.
      </p>

      <form [formGroup]="signupForm" (ngSubmit)="submit()" class="mt-6 space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="label" for="firstName">First name</label>
            <input id="firstName" class="input" type="text" formControlName="firstName" />
          </div>
          <div>
            <label class="label" for="lastName">Last name</label>
            <input id="lastName" class="input" type="text" formControlName="lastName" />
          </div>
        </div>

        <div>
          <label class="label" for="username">Username (optional)</label>
          <input id="username" class="input" type="text" formControlName="username" />
        </div>

        <div>
          <label class="label" for="email">Email</label>
          <input id="email" class="input" type="email" formControlName="email" />
          <p *ngIf="emailTouchedAndInvalid" class="mt-1 text-xs text-red-600">Valid email is required.</p>
        </div>

        <div>
          <label class="label" for="phone">Phone (optional)</label>
          <input id="phone" class="input" type="text" formControlName="phone" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="label" for="password">Password</label>
            <input id="password" class="input" type="password" formControlName="password" />
            <p *ngIf="passwordTouchedAndInvalid" class="mt-1 text-xs text-red-600">Password must have at least 8 characters.</p>
          </div>
          <div>
            <label class="label" for="confirmPassword">Confirm password</label>
            <input id="confirmPassword" class="input" type="password" formControlName="confirmPassword" />
            <p *ngIf="passwordMismatch" class="mt-1 text-xs text-red-600">Passwords do not match.</p>
          </div>
        </div>

        <div *ngIf="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {{ successMessage }}
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? 'Creating account...' : 'Create account' }}
          </button>
          <button type="button" (click)="login()" class="btn btn-secondary">Login</button>
          <a routerLink="/" class="text-sm text-primary-700 hover:text-primary-800">Back to home</a>
        </div>
      </form>
    </section>
  `
})
export class SignupComponent {
  submitting = false;
  successMessage = '';
  errorMessage = '';

  readonly signupForm;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService
  ) {
    this.signupForm = this.fb.nonNullable.group({
      firstName: [''],
      lastName: [''],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get emailTouchedAndInvalid(): boolean {
    const email = this.signupForm.controls.email;
    return email.touched && email.invalid;
  }

  get passwordTouchedAndInvalid(): boolean {
    const password = this.signupForm.controls.password;
    return password.touched && password.invalid;
  }

  get passwordMismatch(): boolean {
    const password = this.signupForm.controls.password.value;
    const confirm = this.signupForm.controls.confirmPassword.value;
    return !!password && !!confirm && password !== confirm;
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signupForm.invalid || this.passwordMismatch) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.signupForm.getRawValue();

    this.authService.signUp({
      email: value.email,
      password: value.password,
      firstName: value.firstName || undefined,
      lastName: value.lastName || undefined,
      phone: value.phone || undefined,
      username: value.username || undefined
    }).subscribe({
      next: (response) => {
        this.successMessage = `${response.message}. You can now login.`;
        this.signupForm.reset();
        this.submitting = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Could not create account. Please try again.';
        this.submitting = false;
      }
    });
  }

  login(): void {
    this.authService.login();
  }
}


