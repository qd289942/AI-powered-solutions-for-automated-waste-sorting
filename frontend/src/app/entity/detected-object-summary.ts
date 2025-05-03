import {ElasticSearchResponse} from './elastic-search-response';
import {ElasticHit} from './elastic-hit';
import {DetectedObject} from './detected-object';
import {ElasticTopHitsResponse} from './elastic-top-hits-response';

export interface DetectedObjectSummary {
  key: string;
  doc_count: number;
  last_detection: {
    value: number;
    value_as_string: string;
  };
  first_detection: {
    value: number;
    value_as_string: string;
  };
  most_common_class: {
    doc_count_error_upper_bound: number;
    sum_other_doc_count: number;
    buckets: Array<{
      key: string;
      doc_count: number;
    }>;
  };
  average_detection_certainty: {
    value: number;
  };
}

export type DetectedObjectDetailSummary = DetectedObjectSummary & {
  top_hits_docs: ElasticTopHitsResponse<ElasticHit<DetectedObject>>;
};
