export interface Address {
  id?: number;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Country {
  code: string;
  displayName: string;
  locale: string;
  zipCodeLabel: string;
  stateLabel: string;
  cityLabel: string;
  neighborhoodLabel: string;
  streetLabel: string;
  numberLabel: string;
  complementLabel: string;
  zipCodePattern: string;
  autoFillSupported: boolean;
}

export interface AddressConfig {
  code: string;
  displayName: string;
  locale: string;
  zipCodeLabel: string;
  stateLabel: string;
  cityLabel: string;
  neighborhoodLabel: string;
  streetLabel: string;
  numberLabel: string;
  complementLabel: string;
  zipCodePattern: string;
  autoFillSupported: boolean;
  currencyCode: string;
  currencySymbol: string;
}
