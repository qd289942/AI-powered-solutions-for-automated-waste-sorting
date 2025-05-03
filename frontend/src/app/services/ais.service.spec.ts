import { TestBed } from '@angular/core/testing';

import { AisService } from './ais.service';

describe('AisService', () => {
  let service: AisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
