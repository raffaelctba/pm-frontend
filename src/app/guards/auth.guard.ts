import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  if (!keycloak.authenticated) {
    await keycloak.login({
      redirectUri: window.location.origin
    });
    return false;
  }

  return true;
};
