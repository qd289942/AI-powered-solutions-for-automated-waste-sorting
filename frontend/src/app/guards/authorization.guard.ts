import {CanActivateFn, Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {inject} from '@angular/core';

export const authorizationGuard: CanActivateFn = (route, state) => {
  const localStorage = inject(LocalStorageService);
  const router = inject(Router);

  if(!localStorage.hasToken()) {
    router.navigateByUrl('/login').then();
    return false;
  }

  return true;
};
