import {Injectable} from '@angular/core';
import {ApiClientService} from './api-client.service';
import {map, Observable} from 'rxjs';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiClient: ApiClientService, private localStorageService: LocalStorageService) { }

  public login(username: string, password: string): Observable<boolean> {
    return this.apiClient.post<{
      status: 'success' | 'Unauthorized';
      token?: string;
    }>('/auth/login', {
      username,
      password
    }).pipe(map(res => {
      const success = res.status === 'success';

      if (success) {
        this.localStorageService.set('token', res.token!);
      }

      return success;
    }));
  }
}
