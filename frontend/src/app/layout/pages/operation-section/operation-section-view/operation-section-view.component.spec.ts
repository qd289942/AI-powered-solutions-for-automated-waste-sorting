import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationSectionViewComponent } from './operation-section-view.component';

describe('OperationSectionViewComponent', () => {
  let component: OperationSectionViewComponent;
  let fixture: ComponentFixture<OperationSectionViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationSectionViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OperationSectionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
