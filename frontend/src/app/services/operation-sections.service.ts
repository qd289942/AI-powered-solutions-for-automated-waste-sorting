import { Injectable } from '@angular/core';
import {ApiClientService} from './api-client.service';
import {ElasticSearchResponse} from '../entity/elastic-search-response';
import {DetectedObject} from '../entity/detected-object';
import {ElasticHit} from '../entity/elastic-hit';
import {OperationSection} from '../entity/operation-section';
import {map} from 'rxjs';
import {Ai} from '../entity/ai';

@Injectable({
  providedIn: 'root'
})
export class OperationSectionsService {

  constructor(private apiClient: ApiClientService) { }

  public list() {
    return this.apiClient.get<Array<OperationSection>>('/operation-sections');
  }

  public get(id: number) {
    return this.apiClient.get<OperationSection & {ai: Ai}>('/operation-sections/' + id);
  }

  public delete(id: number) {
    return this.apiClient.delete<OperationSection>('/operation-sections/' + id);
  }

  public update(operationSectionUpdate: Partial<OperationSection> & {operationSectionUpdate: number}) {
    return this.apiClient.put<OperationSection>('/operation-sections', operationSectionUpdate);
  }

  public create(operationSection: OperationSection) {
    return this.apiClient.post<OperationSection>('/operation-sections', operationSection);
  }

  public isNameAlreadyUsed(operationSectionName: string, currentOperationSectionId ?: number) {
    let request: {name: string, operationSectionId ?: number} = {
      "name": operationSectionName
    };

    if(currentOperationSectionId) {
      request['operationSectionId'] = currentOperationSectionId;
    }

    return this.apiClient.post<{available: boolean}>('/operation-sections/validate-name', request).pipe(map(res => !res.available));
  }
}
