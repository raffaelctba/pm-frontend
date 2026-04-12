import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRoutingRule, PaymentRoutingRuleRequest, CountryPaymentRouting } from '../models/payment-routing.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentRoutingService {
  private apiUrl = '/api/payment/routing-rules';

  constructor(private http: HttpClient) { }

  /**
   * Get all payment routing rules
   */
  getAllRules(): Observable<PaymentRoutingRule[]> {
    return this.http.get<PaymentRoutingRule[]>(`${this.apiUrl}`);
  }

  /**
   * Get routing rules by country code
   */
  getRulesByCountry(countryCode: string): Observable<PaymentRoutingRule[]> {
    return this.http.get<PaymentRoutingRule[]>(`${this.apiUrl}/country/${countryCode}`);
  }

  /**
   * Get routing rules by country and payment method
   */
  getRulesByCountryAndMethod(countryCode: string, paymentMethod: string): Observable<PaymentRoutingRule[]> {
    return this.http.get<PaymentRoutingRule[]>(
      `${this.apiUrl}/country/${countryCode}/method/${paymentMethod}`
    );
  }

  /**
   * Get country-specific payment routing configuration
   */
  getCountryConfiguration(countryCode: string): Observable<CountryPaymentRouting> {
    return this.http.get<CountryPaymentRouting>(`${this.apiUrl}/country-config/${countryCode}`);
  }

  /**
   * Create a new payment routing rule
   */
  createRule(request: PaymentRoutingRuleRequest): Observable<PaymentRoutingRule> {
    return this.http.post<PaymentRoutingRule>(`${this.apiUrl}`, request);
  }

  /**
   * Update an existing payment routing rule
   */
  updateRule(id: number, request: PaymentRoutingRuleRequest): Observable<PaymentRoutingRule> {
    return this.http.put<PaymentRoutingRule>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Enable or disable a payment routing rule
   */
  enableRule(id: number, enabled: boolean): Observable<PaymentRoutingRule> {
    return this.http.patch<PaymentRoutingRule>(`${this.apiUrl}/${id}/enabled`, { enabled });
  }

  /**
   * Delete a payment routing rule
   */
  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Reorder routing rules (update priorities)
   */
  updateRulePriorities(rules: PaymentRoutingRule[]): Observable<PaymentRoutingRule[]> {
    return this.http.post<PaymentRoutingRule[]>(`${this.apiUrl}/reorder`, rules);
  }

  /**
   * Get routing rules for admin panel (with pagination)
   */
  getRulesForAdmin(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }
}

