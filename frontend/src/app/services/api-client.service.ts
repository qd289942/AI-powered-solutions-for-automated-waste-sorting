import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {

  constructor(private http: HttpClient) {
  }

  public get<T>(endpoint: string, params: { [key: string]: any } = {}) {
    return this.http.get<T>(environment.apiEndpoint + endpoint, {
      params: this.buildQueryParams(params),
      headers: new HttpHeaders({'Accept': 'application/json'})
    });
  }

  public post<T>(endpoint: string, body: {}) {
    return this.http.post<T>(environment.apiEndpoint + endpoint, body, {
      headers: new HttpHeaders({'Accept': 'application/json'})
    });
  }

  public put<T>(endpoint: string, body: {}) {
    return this.http.put<T>(environment.apiEndpoint + endpoint, body, {
      headers: new HttpHeaders({'Accept': 'application/json'})
    });
  }

  public delete<T>(endpoint: string, params: { [key: string]: any } = {}) {
    return this.http.delete<T>(environment.apiEndpoint + endpoint, {
      params: this.buildQueryParams(params),
      headers: new HttpHeaders({'Accept': 'application/json'})
    });
  }

  private buildQueryParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }

    return httpParams;
  }
}
