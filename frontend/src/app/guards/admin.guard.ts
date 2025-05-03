import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {LocalStorageService} from '../services/local-storage.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const localStorage = inject(LocalStorageService);
  return localStorage.isAdmin();
};
