import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { homeRedirectGuard } from './guards/home-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [homeRedirectGuard],
    loadComponent: () => import('./pages/landing-home/landing-home.component').then(m => m.LandingHomeComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'portfolio',
    loadChildren: () => import('./portfolio/portfolio.module').then(m => m.PortfolioModule),
    canActivate: [authGuard],
  },
  {
    path: 'property/:id',
    loadChildren: () => import('./property/property.module').then(m => m.PropertyModule),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    redirectTo: 'portfolio',
    pathMatch: 'full'
  },
  {
    path: 'dashboard/property/:id',
    redirectTo: 'property/:id'
  },
  {
    path: 'properties',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/properties/property-list/property-list.component').then(m => m.PropertyListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/properties/property-form/property-form.component').then(m => m.PropertyFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/properties/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
      },
      {
        path: ':id/manage',
        redirectTo: '/property/:id'
      },
      {
        path: ':id/units',
        redirectTo: '/property/:id/units'
      },
      {
        path: ':id/units/:unitId',
        redirectTo: '/property/:id/units/:unitId'
      },
      {
        path: ':id/leases',
        redirectTo: '/property/:id/leases'
      },
      {
        path: ':id/units/:unitId/leases',
        redirectTo: '/property/:id/units/:unitId/leases'
      },
      {
        path: ':id/work-orders',
        redirectTo: '/property/:id/work-orders'
      },
      {
        path: ':id/compliance',
        redirectTo: '/property/:id/compliance'
      },
      {
        path: ':id/documents',
        redirectTo: '/property/:id/documents'
      },
      {
        path: ':id/incidents',
        redirectTo: '/property/:id/incidents'
      },
      {
        path: ':id/finances',
        redirectTo: '/property/:id/finances'
      },
      {
        path: ':id/billing',
        redirectTo: '/property/:id/billing'
      },
      {
        path: ':id/billing/charges',
        redirectTo: '/property/:id/billing/charges'
      },
      {
        path: ':id/billing/statements',
        redirectTo: '/property/:id/billing/statements'
      },
      {
        path: ':id/billing/payments',
        redirectTo: '/property/:id/billing/payments'
      },
      {
        path: ':id/billing/approvals',
        redirectTo: '/property/:id/billing/approvals'
      },
      {
        path: ':id/billing/reconciliation',
        redirectTo: '/property/:id/billing/reconciliation'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/properties/property-form/property-form.component').then(m => m.PropertyFormComponent)
      }
    ],
    canActivate: [authGuard]
  },
  {
    path: 'invoices',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
      },
      {
        path: ':invoiceId/pay',
        loadComponent: () => import('./payments').then(m => m.PaymentCheckoutComponent)
      }
    ],
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
