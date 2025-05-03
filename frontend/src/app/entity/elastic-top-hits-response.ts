import {ElasticHit} from './elastic-hit';

export interface ElasticTopHitsResponse<T> {
  hits: {
    total: {
      value: number;
    },
    max_score: number;
    hits: Array<T>;
  };
}
