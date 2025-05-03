import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
  }

  public get(key: string): string | null {
    return localStorage.getItem(key);
  }

  public set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  public hasToken() {
    return this.get('token') !== null;
  }

  getToken() {
    return this.get('token');
  }

  isAdmin() {
    const parsedPayload = this.getParsedPayload();
    return parsedPayload.role === 'ADMIN';
  }

  getUsername() {
    const parsedPayload = this.getParsedPayload();
    return parsedPayload.username;
  }

  private getParsedPayload() {
    const token = this.get('token')!;
    const decodedPayload  = atob(token.split('.')[1]);
    return JSON.parse(decodedPayload);
  }

  removeToken() {
    return localStorage.removeItem('token');
  }
}
