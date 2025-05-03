import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationSectionFormComponent } from './operation-section-form.component';

describe('OperationSectionFormComponent', () => {
  let component: OperationSectionFormComponent;
  let fixture: ComponentFixture<OperationSectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationSectionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OperationSectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
