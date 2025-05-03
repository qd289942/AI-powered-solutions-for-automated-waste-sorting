import {ElasticHit} from './elastic-hit';


export interface ElasticSearchResponse<T> {
  hits: Array<ElasticHit<T>>;
  total: {
    value: number;
  };
}
