import { Injectable } from '@angular/core';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private currencies: Map<string, CurrencyConfig> = new Map([
    ['BRL', { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', locale: 'pt-BR', decimalPlaces: 2 }],
    ['USD', { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimalPlaces: 2 }],
    ['CAD', { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimalPlaces: 2 }],
    ['EUR', { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimalPlaces: 2 }],
    ['GBP', { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimalPlaces: 2 }],
    ['MXN', { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX', decimalPlaces: 2 }]
  ]);

  constructor() {}

  /**
   * Formats a number as currency using the specified currency code
   */
  formatCurrency(amount: number | null | undefined, currencyCode: string = 'BRL'): string {
    if (amount === null || amount === undefined) {
      return this.getCurrencySymbol(currencyCode) + ' 0,00';
    }

    const config = this.currencies.get(currencyCode);
    if (!config) {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }

    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: config.decimalPlaces,
        maximumFractionDigits: config.decimalPlaces
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${config.symbol} ${amount.toFixed(config.decimalPlaces)}`;
    }
  }

  /**
   * Gets the currency symbol for a given currency code
   */
  getCurrencySymbol(currencyCode: string): string {
    const config = this.currencies.get(currencyCode);
    return config?.symbol || currencyCode;
  }

  /**
   * Gets the currency name for a given currency code
   */
  getCurrencyName(currencyCode: string): string {
    const config = this.currencies.get(currencyCode);
    return config?.name || currencyCode;
  }

  /**
   * Gets the full currency configuration
   */
  getCurrencyConfig(currencyCode: string): CurrencyConfig | undefined {
    return this.currencies.get(currencyCode);
  }

  /**
   * Gets all available currencies
   */
  getAllCurrencies(): CurrencyConfig[] {
    return Array.from(this.currencies.values());
  }

  /**
   * Checks if a currency code is supported
   */
  isCurrencySupported(currencyCode: string): boolean {
    return this.currencies.has(currencyCode);
  }

  /**
   * Gets currency code from country code
   */
  getCurrencyFromCountry(countryCode: string): string {
    const currencyMap: {[key: string]: string} = {
      'BR': 'BRL',
      'US': 'USD',
      'CA': 'CAD',
      'FR': 'EUR',
      'DE': 'EUR',
      'ES': 'EUR',
      'PT': 'EUR',
      'IT': 'EUR',
      'MX': 'MXN',
      'GB': 'GBP'
    };
    return currencyMap[countryCode] || 'BRL';
  }
}
