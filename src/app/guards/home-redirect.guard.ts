import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

export const homeRedirectGuard: CanActivateFn = (): boolean | UrlTree => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  return keycloak.authenticated ? router.parseUrl('/portfolio') : true;
};

