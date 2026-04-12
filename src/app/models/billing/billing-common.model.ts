/**
 * Common billing types and utilities
 */

// Pagination support for billing lists
export interface BillingPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: SortOrder[];
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface SortOrder {
  property: string;
  direction: 'ASC' | 'DESC';
}

// Currency representation
export interface CurrencyAmount {
  amount: number;
  currency: string;
}

// Date period (e.g., billing month)
export interface BillingPeriod {
  year: number;
  month: number;
  startDate: Date;
  endDate: Date;
}

// Audit fields
export interface AuditFields {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy?: string;
}

// Error response from billing APIs
export interface BillingError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Metadata support
export interface Metadata {
  [key: string]: any;
}

