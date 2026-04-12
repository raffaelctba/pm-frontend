export interface PaymentRoutingRule {
  id: number;
  countryCode: string;
  paymentMethod: PaymentMethod;
  provider: PaymentGatewayProvider;
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRoutingRuleRequest {
  countryCode: string;
  paymentMethod: PaymentMethod;
  provider: PaymentGatewayProvider;
  priority: number;
  enabled: boolean;
}

export interface CountryPaymentRouting {
  countryCode: string;
  supportedMethods: PaymentMethod[];
  routingRules: PaymentRoutingRule[];
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX',
  CHECK = 'CHECK'
}

export enum PaymentGatewayProvider {
  MANUAL_FALLBACK = 'MANUAL_FALLBACK',
  BRAZIL_PIX = 'BRAZIL_PIX',
  STRIPE_CARD = 'STRIPE_CARD',
  MERCADOPAGO = 'MERCADOPAGO',
  ADYEN_CARD = 'ADYEN_CARD'
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.DEBIT_CARD]: 'Debit Card',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.PIX]: 'PIX',
  [PaymentMethod.CHECK]: 'Check'
};

export const PaymentGatewayProviderLabels: Record<PaymentGatewayProvider, string> = {
  [PaymentGatewayProvider.MANUAL_FALLBACK]: 'Manual Fallback',
  [PaymentGatewayProvider.BRAZIL_PIX]: 'Brazil PIX',
  [PaymentGatewayProvider.STRIPE_CARD]: 'Stripe Card',
  [PaymentGatewayProvider.MERCADOPAGO]: 'MercadoPago',
  [PaymentGatewayProvider.ADYEN_CARD]: 'Adyen Card'
};

