import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AddressService } from '../../../services/address.service';
import { CurrencyService } from '../../../services/currency.service';
import { I18nService } from '../../../services/i18n.service';
import { AddressConfig } from '../../../models/address.model';
import { PropertyDTO, PropertyType, PropertyUsageType } from '../../../models/property.model';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="px-4 py-6 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        {{ isEditMode ? i18n.translate('common.edit') + ' ' + i18n.translate('property.workspace.propertySummary') : i18n.translate('common.create') + ' ' + i18n.translate('property.workspace.propertySummary') }}
      </h1>

      <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="card space-y-6">
        <!-- Basic Information -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ i18n.translate('property.workspace.propertySummary') }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">{{ i18n.translate('property.workspace.editProperty') }} *</label>
              <input type="text" formControlName="name" class="input"
                     [class.border-red-500]="propertyForm.get('name')?.invalid && propertyForm.get('name')?.touched">
              <p *ngIf="propertyForm.get('name')?.invalid && propertyForm.get('name')?.touched"
                 class="text-red-500 text-sm mt-1">{{ i18n.translate('property.workspace.editProperty') }} is required</p>
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.type') }} *</label>
              <select formControlName="propertyType" class="input" (change)="onPropertyTypeChange()">
                <option value="">Select property type</option>
                <option value="APARTMENT">{{ i18n.translate('property.type.apartment') }}</option>
                <option value="HOUSE">{{ i18n.translate('property.type.house') }}</option>
                <option value="BUILDING">{{ i18n.translate('property.type.building') }}</option>
                <option value="COMMERCIAL_UNIT">{{ i18n.translate('property.type.commercialUnit') }}</option>
                <option value="COMMERCIAL_BUILDING">{{ i18n.translate('property.type.commercialBuilding') }}</option>
              </select>
            </div>

            <div *ngIf="showUsageTypeField()">
              <label class="label">{{ i18n.translate('property.form.usageType') }}</label>
              <select formControlName="usageType" class="input">
                <option value="">{{ i18n.translate('common.optional') }}</option>
                <option value="RENTAL">{{ i18n.translate('property.form.usageType.rental') }}</option>
                <option value="OWNER_OCCUPIED">{{ i18n.translate('property.form.usageType.ownerOccupied') }}</option>
                <option value="VACATION_HOME">{{ i18n.translate('property.form.usageType.vacationHome') }}</option>
                <option value="COMMERCIAL_OWNER_USE">{{ i18n.translate('property.form.usageType.commercialOwnerUse') }}</option>
                <option value="FOR_SALE">{{ i18n.translate('property.form.usageType.forSale') }}</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="label">{{ i18n.translate('property.workspace.notes') }}</label>
              <textarea formControlName="description" rows="3" class="input"></textarea>
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.status') }}</label>
              <select formControlName="status" class="input">
                <option value="ACTIVE">{{ i18n.translate('property.status.active') }}</option>
                <option value="INACTIVE">{{ i18n.translate('property.status.inactive') }}</option>
                <option value="MAINTENANCE">{{ i18n.translate('property.status.maintenance') }}</option>
                <option value="SOLD">{{ i18n.translate('property.status.sold') }}</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Address -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ i18n.translate('property.workspace.address') }}</h2>

          <div formGroupName="address" class="space-y-4">
            <!-- Country Selection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">{{ i18n.translate('property.workspace.address') }} *</label>
                <select formControlName="country" (change)="onCountryChange()" class="input">
                  <option value="">{{ i18n.translate('common.optional') }}</option>
                  <option *ngFor="let country of countries | keyvalue" [value]="country.key">
                    {{ country.value }}
                  </option>
                </select>
              </div>

              <div>
                <label class="label">{{ countryConfig?.zipCodeLabel || 'ZIP' }} *</label>
                <div class="flex gap-2">
                  <input type="text" formControlName="zipCode" class="input flex-1"
                         [placeholder]="getZipCodePlaceholder()"
                         (blur)="onZipCodeBlur()">
                  <button type="button" (click)="autoFillAddress()"
                          [disabled]="!canAutoFill()"
                          class="btn btn-secondary whitespace-nowrap">
                    {{ loadingAddress ? i18n.translate('common.loading') : i18n.translate('common.refresh') }}
                  </button>
                </div>
                <p *ngIf="addressError" class="text-red-500 text-sm mt-1">{{ addressError }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">{{ countryConfig?.streetLabel || i18n.translate('property.workspace.address') }}</label>
                <input type="text" formControlName="street" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.numberLabel || 'No.' }}</label>
                <input type="text" formControlName="number" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.complementLabel || 'Complement' }}</label>
                <input type="text" formControlName="complement" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.neighborhoodLabel || 'Neighborhood' }}</label>
                <input type="text" formControlName="neighborhood" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.cityLabel || 'City' }} *</label>
                <input type="text" formControlName="city" class="input"
                       [class.border-red-500]="propertyForm.get('address.city')?.invalid && propertyForm.get('address.city')?.touched">
                <p *ngIf="propertyForm.get('address.city')?.invalid && propertyForm.get('address.city')?.touched"
                   class="text-red-500 text-sm mt-1">{{ countryConfig?.cityLabel || 'City' }} is required</p>
              </div>

              <div>
                <label class="label">{{ countryConfig?.stateLabel || 'State' }} *</label>
                <input type="text" formControlName="state" class="input"
                       [class.border-red-500]="propertyForm.get('address.state')?.invalid && propertyForm.get('address.state')?.touched">
                <p *ngIf="propertyForm.get('address.state')?.invalid && propertyForm.get('address.state')?.touched"
                   class="text-red-500 text-sm mt-1">{{ countryConfig?.stateLabel || 'State' }} is required</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Property Details -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ i18n.translate('property.workspace.propertySummary') }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Area (m²)</label>
              <input type="number" formControlName="areaSize" class="input">
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.bedrooms') }}</label>
              <input type="number" formControlName="bedrooms" class="input">
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.bathrooms') }}</label>
              <input type="number" formControlName="bathrooms" class="input">
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.parkingSpaces') }}</label>
              <input type="number" formControlName="parkingSpaces" class="input">
            </div>
          </div>
        </div>

        <!-- Building Details -->
        <div *ngIf="isMultiUnitSelected()">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ i18n.translate('property.workspace.buildingManagement') }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">{{ i18n.translate('property.workspace.totalUnits') }}</label>
              <input type="number" formControlName="totalUnits" class="input">
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.monthlyFee') }}</label>
              <input type="number" formControlName="monthlyFee" class="input" step="0.01">
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.dueDay') }}</label>
              <input type="number" formControlName="dueDay" class="input" min="1" max="31">
            </div>

            <div>
              <label class="label">{{ i18n.translate('property.workspace.penaltyRules') }} (%)</label>
              <input type="number" formControlName="lateFeePercentage" class="input" step="0.01">
            </div>

            <div>
              <label class="label">{{ i18n.translate('building.finance.paidAmount') }} (%)</label>
              <input type="number" formControlName="interestRateMonthly" class="input" step="0.01">
            </div>

            <div>
              <label class="label">Grace period (days)</label>
              <input type="number" formControlName="gracePeriodDays" class="input" min="0">
            </div>

            <div>
              <label class="label">Reminder days before due</label>
              <input type="number" formControlName="reminderDaysBeforeDue" class="input" min="0" max="30">
            </div>

            <div>
              <label class="label">Auto-generate invoices</label>
              <input type="checkbox" formControlName="autoGenerateInvoices" class="h-5 w-5 text-primary-600">
            </div>

            <div>
              <label class="label">Auto-send reminders</label>
              <input type="checkbox" formControlName="autoSendReminders" class="h-5 w-5 text-primary-600">
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div *ngIf="submitError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ submitError }}
        </div>

        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            {{ i18n.translate('building.units.cancel') }}
          </button>
          <button type="submit" [disabled]="propertyForm.invalid || saving" class="btn btn-primary">
            {{ saving ? i18n.translate('common.loading') : i18n.translate('common.save') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class PropertyFormComponent implements OnInit {
  propertyForm: FormGroup;
  isEditMode = false;
  propertyId?: number;
  saving = false;
  loadingAddress = false;
  addressError: string | null = null;
  submitError: string | null = null;
  countries: {[key: string]: string} = {};
  countryConfig: AddressConfig | null = null;
  readonly i18n = inject(I18nService);

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private addressService: AddressService,
    public currencyService: CurrencyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.propertyForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      propertyType: ['', Validators.required],
      usageType: [''],
      status: ['ACTIVE'],
      address: this.fb.group({
        street: [''],
        number: [''],
        complement: [''],
        neighborhood: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: [''],
        country: ['BR']
      }),
      areaSize: [null],
      bedrooms: [null],
      bathrooms: [null],
      parkingSpaces: [null],
      totalUnits: [null],
      monthlyFee: [null],
      currencyCode: ['BRL'],
      dueDay: [null],
      lateFeePercentage: [null],
      interestRateMonthly: [null],
      gracePeriodDays: [null],
      autoGenerateInvoices: [true],
      autoSendReminders: [true],
      reminderDaysBeforeDue: [3]
    });
  }

  onPropertyTypeChange(): void {
    if (!this.isMultiUnitSelected()) {
      this.propertyForm.patchValue({ totalUnits: null });
    }

    if (!this.showUsageTypeField()) {
      this.propertyForm.patchValue({ usageType: null });
    }
  }

  isMultiUnitSelected(): boolean {
    const propertyType = this.propertyForm.get('propertyType')?.value as PropertyType | '';
    return propertyType === PropertyType.BUILDING || propertyType === PropertyType.COMMERCIAL_BUILDING;
  }

  showUsageTypeField(): boolean {
    return !this.isMultiUnitSelected();
  }

  ngOnInit(): void {
    this.loadCountries();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.propertyId = +params['id'];
        this.loadProperty();
      } else {
        // Load default country config (Brazil)
        this.loadCountryConfig('BR');
      }
    });
  }

  loadCountries(): void {
    this.addressService.getSupportedCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.addressError = 'Nao foi possivel carregar a lista de paises.';
      }
    });
  }

  loadCountryConfig(countryCode: string): void {
    this.addressService.getCountryConfig(countryCode).subscribe({
      next: (config) => {
        this.countryConfig = config;
      },
      error: (error) => {
        console.error('Error loading country config:', error);
        this.countryConfig = null;
        this.addressError = 'Nao foi possivel carregar a configuracao de endereco para este pais.';
      }
    });
  }

  onCountryChange(): void {
    const countryCode = this.propertyForm.get('address.country')?.value;
    if (countryCode) {
      this.loadCountryConfig(countryCode);
      // Clear zip code when changing country
      this.propertyForm.get('address.zipCode')?.setValue('');
      this.addressError = null;

      // Update currency based on country
      const currency = this.currencyService.getCurrencyFromCountry(countryCode);
      this.propertyForm.get('currencyCode')?.setValue(currency);
    }
  }

  autoFillAddress(): void {
    const zipCode = this.propertyForm.get('address.zipCode')?.value;
    const countryCode = this.propertyForm.get('address.country')?.value;

    if (!zipCode || !countryCode) {
      this.addressError = 'Por favor, informe o país e o código postal';
      return;
    }

    this.loadingAddress = true;
    this.addressError = null;

    this.addressService.autoFillAddress(zipCode, countryCode).subscribe({
      next: (address) => {
        // Fill the form with the retrieved data
        const addressGroup = this.propertyForm.get('address');
        if (addressGroup) {
          addressGroup.patchValue({
            street: address.street || '',
            neighborhood: address.neighborhood || '',
            city: address.city || '',
            state: address.state || '',
            zipCode: address.zipCode || zipCode
          });
        }
        this.loadingAddress = false;
      },
      error: (error) => {
        console.error('Error auto-filling address:', error);
        this.addressError = error.error?.message || 'Erro ao buscar endereço. Verifique o código postal.';
        this.loadingAddress = false;
      }
    });
  }

  onZipCodeBlur(): void {
    const zipCode = this.propertyForm.get('address.zipCode')?.value;
    const countryCode = this.propertyForm.get('address.country')?.value;

    if (zipCode && countryCode && this.countryConfig?.autoFillSupported) {
      this.addressService.validateZipCode(zipCode, countryCode).subscribe({
        next: (result) => {
          if (!result.valid) {
            this.addressError = `Formato de ${this.countryConfig?.zipCodeLabel} inválido`;
          } else {
            this.addressError = null;
          }
        },
        error: (error) => {
          console.error('Error validating zip code:', error);
        }
      });
    }
  }

  canAutoFill(): boolean {
    const zipCode = this.propertyForm.get('address.zipCode')?.value;
    const countryCode = this.propertyForm.get('address.country')?.value;

    if (!zipCode || !countryCode || this.loadingAddress) {
      return false;
    }

    // Keep the button available when config failed to load; backend validation still applies.
    return this.countryConfig ? this.countryConfig.autoFillSupported : true;
  }

  getZipCodePlaceholder(): string {
    if (!this.countryConfig) return '';

    const examples: {[key: string]: string} = {
      'BR': '12345-678',
      'US': '12345 ou 12345-6789',
      'CA': 'A1A 1A1',
      'FR': '75001',
      'DE': '12345',
      'GB': 'SW1A 1AA'
    };

    return examples[this.countryConfig.code] || '';
  }

  loadProperty(): void {
    if (this.propertyId) {
      this.propertyService.getPropertyById(this.propertyId).subscribe({
        next: (property) => {
          const billing = property.billing;
          this.propertyForm.patchValue({
            ...property,
            propertyType: this.normalizeLegacyPropertyType(property.propertyType),
            usageType: property.usageType || PropertyUsageType.RENTAL,
            address: {
              ...property.address,
              country: property.address?.countryCode || 'BR'
            },
            monthlyFee: billing?.monthlyFee ?? property.monthlyFee ?? null,
            currencyCode: billing?.currencyCode ?? property.currencyCode ?? 'BRL',
            dueDay: billing?.dueDay ?? property.dueDay ?? null,
            lateFeePercentage: billing?.lateFeePercentage ?? property.lateFeePercentage ?? null,
            interestRateMonthly: billing?.interestRateMonthly ?? property.interestRateMonthly ?? null,
            gracePeriodDays: billing?.gracePeriodDays ?? null,
            autoGenerateInvoices: billing?.autoGenerateInvoices ?? true,
            autoSendReminders: billing?.autoSendReminders ?? true,
            reminderDaysBeforeDue: billing?.reminderDaysBeforeDue ?? 3
          });
        },
        error: (error) => {
          console.error('Error loading property:', error);
          alert('Erro ao carregar propriedade');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.propertyForm.valid) {
      this.submitError = null;
      this.saving = true;
      const propertyData = this.buildPropertyPayload();

      const request = this.isEditMode && this.propertyId
        ? this.propertyService.updateProperty(this.propertyId, propertyData)
        : this.propertyService.createProperty(propertyData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/properties']);
        },
        error: (error) => {
          console.error('Error saving property:', error);
          this.submitError = this.extractErrorMessage(error, 'Nao foi possivel salvar a propriedade. Verifique os dados e tente novamente.');
          this.saving = false;
        }
      });
    }
  }

  private buildPropertyPayload(): PropertyDTO {
    const formValue = this.propertyForm.getRawValue();
    const billing = this.hasBillingConfig(formValue)
      ? {
          monthlyFee: this.toNumberOrUndefined(formValue.monthlyFee),
          currencyCode: formValue.currencyCode || 'BRL',
          dueDay: this.toNumberOrUndefined(formValue.dueDay),
          lateFeePercentage: this.toNumberOrUndefined(formValue.lateFeePercentage),
          interestRateMonthly: this.toNumberOrUndefined(formValue.interestRateMonthly),
          gracePeriodDays: this.toNumberOrUndefined(formValue.gracePeriodDays),
          autoGenerateInvoices: !!formValue.autoGenerateInvoices,
          autoSendReminders: !!formValue.autoSendReminders,
          reminderDaysBeforeDue: this.toNumberOrUndefined(formValue.reminderDaysBeforeDue)
        }
      : undefined;

    return {
      name: formValue.name,
      description: formValue.description,
      propertyType: formValue.propertyType,
      usageType: this.showUsageTypeField() ? formValue.usageType || undefined : undefined,
      status: formValue.status,
      address: {
        street: formValue.address?.street,
        number: formValue.address?.number,
        complement: formValue.address?.complement,
        neighborhood: formValue.address?.neighborhood,
        city: formValue.address?.city,
        state: formValue.address?.state,
        zipCode: formValue.address?.zipCode,
        countryCode: formValue.address?.country || 'BR'
      },
      areaSize: this.toNumberOrUndefined(formValue.areaSize),
      bedrooms: this.toNumberOrUndefined(formValue.bedrooms),
      bathrooms: this.toNumberOrUndefined(formValue.bathrooms),
      parkingSpaces: this.toNumberOrUndefined(formValue.parkingSpaces),
      totalUnits: this.toNumberOrUndefined(formValue.totalUnits),
      billing
    };
  }

  private hasBillingConfig(formValue: any): boolean {
    return [
      formValue.monthlyFee,
      formValue.currencyCode,
      formValue.dueDay,
      formValue.lateFeePercentage,
      formValue.interestRateMonthly,
      formValue.gracePeriodDays,
      formValue.autoGenerateInvoices,
      formValue.autoSendReminders,
      formValue.reminderDaysBeforeDue
    ].some((value) => value !== null && value !== undefined && `${value}`.trim() !== '');
  }

  private toNumberOrUndefined(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private normalizeLegacyPropertyType(value: PropertyType | string | undefined): PropertyType | string | undefined {
    if (value === 'COMMERCIAL') {
      return PropertyType.COMMERCIAL_UNIT;
    }
    if (value === 'LAND') {
      return PropertyType.HOUSE;
    }
    return value;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;

      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }

      if (payload && typeof payload === 'object') {
        const backendMessage = payload['message'] ?? payload['error_description'] ?? payload['detail'];
        if (typeof backendMessage === 'string' && backendMessage.trim()) {
          return backendMessage;
        }

        const validationErrors = payload['errors'];
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          const first = validationErrors[0];
          if (typeof first === 'string' && first.trim()) {
            return first;
          }
          if (first && typeof first === 'object' && typeof first['message'] === 'string' && first['message'].trim()) {
            return first['message'];
          }
        }
      }

      if (error.status === 0) {
        return 'Nao foi possivel conectar ao servidor. Verifique sua conexao e tente novamente.';
      }
    }

    return fallback;
  }

  cancel(): void {
    this.router.navigate(['/properties']);
  }
}
