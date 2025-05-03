import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationSectionCreateComponent } from './operation-section-create.component';

describe('OperationSectionCreateComponent', () => {
  let component: OperationSectionCreateComponent;
  let fixture: ComponentFixture<OperationSectionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationSectionCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationSectionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
