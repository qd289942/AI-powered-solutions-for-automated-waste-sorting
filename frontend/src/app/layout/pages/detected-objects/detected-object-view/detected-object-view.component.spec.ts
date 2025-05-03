import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectedObjectViewComponent } from './detected-object-view.component';

describe('DetectedObjectViewComponent', () => {
  let component: DetectedObjectViewComponent;
  let fixture: ComponentFixture<DetectedObjectViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetectedObjectViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetectedObjectViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
