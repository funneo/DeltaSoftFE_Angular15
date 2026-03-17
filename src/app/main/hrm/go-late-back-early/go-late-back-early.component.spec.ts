import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoLateBackEarlyComponent } from './go-late-back-early.component';

describe('GoLateBackEarlyComponent', () => {
  let component: GoLateBackEarlyComponent;
  let fixture: ComponentFixture<GoLateBackEarlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoLateBackEarlyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoLateBackEarlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
