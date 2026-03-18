import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AddressService } from '../../../services/address.service';
import { CurrencyService } from '../../../services/currency.service';
import { PropertyType, PropertyStatus } from '../../../models/property.model';
import { AddressConfig } from '../../../models/address.model';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="px-4 py-6 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        {{ isEditMode ? 'Editar Propriedade' : 'Nova Propriedade' }}
      </h1>

      <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="card space-y-6">
        <!-- Basic Information -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Nome *</label>
              <input type="text" formControlName="name" class="input"
                     [class.border-red-500]="propertyForm.get('name')?.invalid && propertyForm.get('name')?.touched">
              <p *ngIf="propertyForm.get('name')?.invalid && propertyForm.get('name')?.touched"
                 class="text-red-500 text-sm mt-1">Nome é obrigatório</p>
            </div>

            <div>
              <label class="label">Tipo *</label>
              <select formControlName="propertyType" class="input">
                <option value="">Selecione...</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="BUILDING">Prédio</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="LAND">Terreno</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="label">Descrição</label>
              <textarea formControlName="description" rows="3" class="input"></textarea>
            </div>

            <div>
              <label class="label">Status</label>
              <select formControlName="status" class="input">
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="MAINTENANCE">Manutenção</option>
                <option value="SOLD">Vendido</option>
              </select>
            </div>

            <div>
              <label class="label">É um prédio?</label>
              <input type="checkbox" formControlName="isBuilding" class="h-5 w-5 text-primary-600">
            </div>
          </div>
        </div>

        <!-- Address -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Endereço</h2>

          <div formGroupName="address" class="space-y-4">
            <!-- Country Selection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">País *</label>
                <select formControlName="country" (change)="onCountryChange()" class="input">
                  <option value="">Selecione...</option>
                  <option *ngFor="let country of countries | keyvalue" [value]="country.key">
                    {{ country.value }}
                  </option>
                </select>
              </div>

              <div>
                <label class="label">{{ countryConfig?.zipCodeLabel || 'CEP' }} *</label>
                <div class="flex gap-2">
                  <input type="text" formControlName="zipCode" class="input flex-1"
                         [placeholder]="getZipCodePlaceholder()"
                         (blur)="onZipCodeBlur()">
                  <button type="button" (click)="autoFillAddress()"
                          [disabled]="!canAutoFill()"
                          class="btn btn-secondary whitespace-nowrap">
                    {{ loadingAddress ? 'Buscando...' : 'Buscar' }}
                  </button>
                </div>
                <p *ngIf="addressError" class="text-red-500 text-sm mt-1">{{ addressError }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">{{ countryConfig?.streetLabel || 'Rua' }}</label>
                <input type="text" formControlName="street" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.numberLabel || 'Número' }}</label>
                <input type="text" formControlName="number" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.complementLabel || 'Complemento' }}</label>
                <input type="text" formControlName="complement" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.neighborhoodLabel || 'Bairro' }}</label>
                <input type="text" formControlName="neighborhood" class="input">
              </div>

              <div>
                <label class="label">{{ countryConfig?.cityLabel || 'Cidade' }} *</label>
                <input type="text" formControlName="city" class="input"
                       [class.border-red-500]="propertyForm.get('address.city')?.invalid && propertyForm.get('address.city')?.touched">
                <p *ngIf="propertyForm.get('address.city')?.invalid && propertyForm.get('address.city')?.touched"
                   class="text-red-500 text-sm mt-1">{{ countryConfig?.cityLabel || 'Cidade' }} é obrigatório</p>
              </div>

              <div>
                <label class="label">{{ countryConfig?.stateLabel || 'Estado' }} *</label>
                <input type="text" formControlName="state" class="input"
                       [class.border-red-500]="propertyForm.get('address.state')?.invalid && propertyForm.get('address.state')?.touched">
                <p *ngIf="propertyForm.get('address.state')?.invalid && propertyForm.get('address.state')?.touched"
                   class="text-red-500 text-sm mt-1">{{ countryConfig?.stateLabel || 'Estado' }} é obrigatório</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Property Details -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Detalhes da Propriedade</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Área (m²)</label>
              <input type="number" formControlName="areaSize" class="input">
            </div>

            <div>
              <label class="label">Quartos</label>
              <input type="number" formControlName="bedrooms" class="input">
            </div>

            <div>
              <label class="label">Banheiros</label>
              <input type="number" formControlName="bathrooms" class="input">
            </div>

            <div>
              <label class="label">Vagas de Estacionamento</label>
              <input type="number" formControlName="parkingSpaces" class="input">
            </div>
          </div>
        </div>

        <!-- Building Details -->
        <div *ngIf="propertyForm.get('isBuilding')?.value">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Configurações do Prédio</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Total de Unidades</label>
              <input type="number" formControlName="totalUnits" class="input">
            </div>

            <div>
              <label class="label">Taxa Mensal</label>
              <input type="number" formControlName="monthlyFee" class="input" step="0.01">
            </div>

            <div>
              <label class="label">Dia de Vencimento</label>
              <input type="number" formControlName="dueDay" class="input" min="1" max="31">
            </div>

            <div>
              <label class="label">Taxa de Multa (%)</label>
              <input type="number" formControlName="lateFeePercentage" class="input" step="0.01">
            </div>

            <div>
              <label class="label">Juros Mensal (%)</label>
              <input type="number" formControlName="interestRateMonthly" class="input" step="0.01">
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" [disabled]="propertyForm.invalid || saving" class="btn btn-primary">
            {{ saving ? 'Salvando...' : 'Salvar' }}
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
  countries: {[key: string]: string} = {};
  countryConfig: AddressConfig | null = null;

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
      isBuilding: [false],
      totalUnits: [null],
      monthlyFee: [null],
      currencyCode: ['BRL'],
      dueDay: [null],
      lateFeePercentage: [null],
      interestRateMonthly: [null]
    });
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
    return !!(zipCode && countryCode && this.countryConfig?.autoFillSupported && !this.loadingAddress);
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
          this.propertyForm.patchValue(property);
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
      this.saving = true;
      const propertyData = this.propertyForm.value;

      const request = this.isEditMode && this.propertyId
        ? this.propertyService.updateProperty(this.propertyId, propertyData)
        : this.propertyService.createProperty(propertyData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/properties']);
        },
        error: (error) => {
          console.error('Error saving property:', error);
          alert('Erro ao salvar propriedade');
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/properties']);
  }
}
