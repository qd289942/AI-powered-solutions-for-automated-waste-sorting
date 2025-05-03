export interface ElasticHit<T> {
  _index: string;
  _type: '_doc';
  _id: string;
  _score: number;
  _source: T;
}
