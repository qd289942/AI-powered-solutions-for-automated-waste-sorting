import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationSectionEditComponent } from './operation-section-edit.component';

describe('OperationSectionEditComponent', () => {
  let component: OperationSectionEditComponent;
  let fixture: ComponentFixture<OperationSectionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationSectionEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationSectionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
