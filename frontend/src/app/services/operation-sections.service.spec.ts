import { TestBed } from '@angular/core/testing';

import { OperationSectionsService } from './operation-sections.service';

describe('OperationSectionsService', () => {
  let service: OperationSectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationSectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
