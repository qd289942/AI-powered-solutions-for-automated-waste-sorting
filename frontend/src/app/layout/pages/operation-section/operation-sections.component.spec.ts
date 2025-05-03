import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationSectionsComponent } from './operation-sections.component';

describe('OperationSectionComponent', () => {
  let component: OperationSectionsComponent;
  let fixture: ComponentFixture<OperationSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationSectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
