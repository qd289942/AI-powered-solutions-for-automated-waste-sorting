import { TestBed } from '@angular/core/testing';

import { DetectedObjectsService } from './detected-objects.service';

describe('DetectedObjectsService', () => {
  let service: DetectedObjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetectedObjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
