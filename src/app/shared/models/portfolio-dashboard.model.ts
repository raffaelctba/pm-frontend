export interface PortfolioStatsVm {
  totalProperties: number;
  buildingCount: number;
  privateCount: number;
  occupancyRate: number;
  totalIncome: number;
  openMaintenanceRequests: number;
  outstandingInvoices: number;
  paidInvoices: number;
  criticalIncidents: number;
  pendingWorkOrders: number;
  pendingCompliance: number;
}

export interface PortfolioPropertyCardVm {
  id: number;
  name: string;
  propertyType: string;
  currentUserRole?: string;
  imageUrl?: string;
}

export interface PortfolioActivityVm {
  type: 'incident' | 'work-order' | 'compliance' | 'document';
  title: string;
  status: string;
  timestamp: string;
}

export interface PortfolioDashboardVm {
  stats: PortfolioStatsVm;
  properties: PortfolioPropertyCardVm[];
  recentActivity: PortfolioActivityVm[];
  health: {
    degraded: boolean;
    message: string;
    sources: string[];
  };
}

