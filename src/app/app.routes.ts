import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-home/landing-home.component').then(m => m.LandingHomeComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
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
      }
    ],
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
