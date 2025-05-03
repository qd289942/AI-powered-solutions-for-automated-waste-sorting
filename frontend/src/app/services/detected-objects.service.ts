import { Injectable } from '@angular/core';
import {ApiClientService} from './api-client.service';
import {ElasticSearchResponse} from '../entity/elastic-search-response';
import {DetectedObject} from '../entity/detected-object';
import {ElasticHit} from '../entity/elastic-hit';
import {DetectedObjectDetailSummary, DetectedObjectSummary} from '../entity/detected-object-summary';
import {environment} from '../../environments/environment';
import {PaginatedResponse} from '../entity/paginated-response';

@Injectable({
  providedIn: 'root'
})
export class DetectedObjectsService {

  constructor(private apiClient: ApiClientService) { }

  public list(page: number = 1, perPage: number = 30) {
    return this.apiClient.get<PaginatedResponse<DetectedObjectSummary>>('/object-detection/list', {
      page,
      perPage
    });
  }

  public get(trackingId: string) {
    return this.apiClient.get<DetectedObjectDetailSummary>('/object-detection/get/' + trackingId);
  }

  public downloadImages(trackingId: string) {
    location.href = environment.apiEndpoint + '/object-detection/downloadImages/' + trackingId;
  }
}
