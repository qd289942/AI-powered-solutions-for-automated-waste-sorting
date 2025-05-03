import { Injectable } from '@angular/core';
import {ApiClientService} from './api-client.service';
import {OperationSection} from '../entity/operation-section';
import {Ai} from '../entity/ai';

@Injectable({
  providedIn: 'root'
})
export class AisService {

  constructor(private apiClient: ApiClientService) { }

  public list() {
    return this.apiClient.get<Array<Ai>>('/ai');
  }
}
