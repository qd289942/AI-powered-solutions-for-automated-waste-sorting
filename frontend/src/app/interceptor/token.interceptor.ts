import {HttpHeaders, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {LocalStorageService} from '../services/local-storage.service';
import {environment} from '../../environments/environment';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorage = inject(LocalStorageService);

  const requestPath = req.url.replace(environment.apiEndpoint, '');

  if(requestPath !== '/auth/login') {
    const cloned = req.clone({
      headers: new HttpHeaders({Authorization: `${localStorage.getToken()}`})
    });

    return next(cloned);
  }

  return next(req);
};
