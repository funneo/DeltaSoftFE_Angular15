import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadCanonComponent } from './road-canon.component';

describe('RoadCanonComponent', () => {
  let component: RoadCanonComponent;
  let fixture: ComponentFixture<RoadCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoadCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoadCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
