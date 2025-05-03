import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectedObjectsComponent } from './detected-objects.component';

describe('DetectedObjectsComponent', () => {
  let component: DetectedObjectsComponent;
  let fixture: ComponentFixture<DetectedObjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetectedObjectsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetectedObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
