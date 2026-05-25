import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { InvitationInfoResponse } from '../../../models/auth.model';

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

      @if (invitationLoading) {
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Loading invitation details...
        </div>
      }

      @if (invitationInfo) {
        <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-900">
          <p class="font-semibold">Invitation detected</p>
          <p class="mt-1">{{ invitationInfo.buildingName }} · Unit {{ invitationInfo.unitNumber }}</p>
          <p>Role: {{ invitationInfo.invitationRole }}</p>
          <p>Status: {{ invitationInfo.status }}</p>
        </div>
      }

      <!-- Step 1: single field (email or phone) -->
      <div *ngIf="step === 'contact'" class="mt-6">
        <label class="label" for="contact">Email or phone</label>
        <div class="flex gap-2">
          <input id="contact" #contactInput class="input flex-1" type="text" />
          <button class="btn btn-primary" (click)="begin(contactInput.value)">Continue</button>
        </div>
        <p *ngIf="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
      </div>

      <!-- Step 2: verification for email/phone -->
      <div *ngIf="step === 'verify'" class="mt-6">
        <p class="text-sm text-slate-600">A verification code was sent to {{ currentContact }}. Enter the code below to continue.</p>
        <div class="flex gap-2 mt-3">
          <input id="code" #codeInput class="input" type="text" />
          <button class="btn btn-primary" (click)="verifyCode(codeInput.value)">Verify</button>
        </div>
        <p *ngIf="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
      </div>

      <!-- Step 3: full signup form -->
      <form *ngIf="step === 'full'" [formGroup]="signupForm" (ngSubmit)="submit()" class="mt-6 space-y-4">
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
          <input id="email" class="input" type="email" formControlName="email" [readonly]="emailLocked || signupForm.controls.email.disabled" />
          <p *ngIf="emailTouchedAndInvalid" class="mt-1 text-xs text-red-600">Valid email is required.</p>
          <p *ngIf="emailLocked" class="mt-1 text-xs text-slate-500">This email comes from your invitation.</p>
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
export class SignupComponent implements OnInit {
  submitting = false;
  successMessage = '';
  errorMessage = '';
  invitationLoading = false;
  invitationInfo: InvitationInfoResponse | null = null;
  invitationToken = '';
  emailLocked = false;
  step: 'contact' | 'verify' | 'full' = 'contact';
  currentContact = '';

  readonly signupForm;

  private readonly route = inject(ActivatedRoute);

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

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('invitationToken')?.trim() ?? '';
      this.invitationToken = token;

      if (!token) {
        this.emailLocked = false;
        this.invitationInfo = null;
        return;
      }

      this.invitationLoading = true;
      this.authService.getInvitationInfo(token).subscribe({
        next: (info) => {
          this.invitationInfo = info;
          this.signupForm.controls.email.setValue(info.inviteeEmail ?? '');
          this.signupForm.controls.email.disable({ emitEvent: false });
          this.emailLocked = true;
          this.step = 'full';
          this.invitationLoading = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Invalid or expired invitation link.';
          this.invitationLoading = false;
          this.emailLocked = false;
        }
      });
    });
  }

  begin(contactValue: string): void {
    this.errorMessage = '';
    const contact = (contactValue ?? '').trim();

    if (!contact) {
      this.errorMessage = 'Please enter an email or phone number.';
      return;
    }

    this.currentContact = contact;

    this.authService.startPreauth(contact).subscribe({
      next: () => {
        this.step = 'verify';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Could not start verification. Please try again.';
      }
    });
  }

  verifyCode(codeValue: string): void {
    this.errorMessage = '';
    const code = (codeValue ?? '').trim();

    if (!this.currentContact || !code) {
      this.errorMessage = 'Contact and code are required.';
      return;
    }

    this.authService.verifyPreauth(this.currentContact, code).subscribe({
      next: () => {
        if (!this.emailLocked && this.currentContact.includes('@')) {
          this.signupForm.controls.email.setValue(this.currentContact);
        } else if (!this.emailLocked) {
          const syntheticEmail = `${this.currentContact.replace(/[^a-zA-Z0-9]/g, '')}@phone.myproperty`;
          this.signupForm.controls.email.setValue(syntheticEmail);
        }

        if (!this.currentContact.includes('@')) {
          this.signupForm.controls.phone.setValue(this.currentContact);
        }

        this.step = 'full';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Invalid or expired verification code.';
      }
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
      username: value.username || undefined,
      invitationToken: this.invitationToken || undefined
    }).subscribe({
      next: (response) => {
        this.successMessage = `${response.message}. You can now login.`;
        this.signupForm.reset();
        if (this.emailLocked) {
          this.signupForm.controls.email.disable({ emitEvent: false });
        } else {
          this.signupForm.controls.email.enable({ emitEvent: false });
        }
        this.submitting = false;
        window.setTimeout(() => this.login(), 800);
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


