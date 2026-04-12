export interface PropertyHeaderVm {
  name: string;
  breadcrumbLabel: string;
  subtitle: string;
  typeLabel: string;
  statusLabel: string;
  addressLabel: string;
}

export interface PropertySummaryCardsVm {
  valuationLabel: string;
  monthlyIncomeLabel: string;
  occupancyRate: number;
  maintenanceStatusLabel: string;
}

export interface PropertySidebarVm {
  locationLabel: string;
  upcomingPaymentsLabel: string;
  alertsLabel: string;
  linkedUsers?: Array<{
    userId: number;
    fullName: string;
    email: string;
    role?: string;
  }>;
}

export interface PropertyOverviewVm {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  documentsCount: number;
  incidentsOpen: number;
  workOrdersOpen: number;
  compliancePending: number;
}

export interface PropertyActivityVm {
  type: 'incident' | 'work-order' | 'compliance' | 'document';
  title: string;
  status: string;
  timestamp: string;
}

export interface PropertyDashboardVm {
  id: number;
  header: PropertyHeaderVm;
  summary: PropertySummaryCardsVm;
  sidebar: PropertySidebarVm;
  overview: PropertyOverviewVm;
  recentActivity: PropertyActivityVm[];
  health: {
    degraded: boolean;
    message: string;
    sources: string[];
  };
}

