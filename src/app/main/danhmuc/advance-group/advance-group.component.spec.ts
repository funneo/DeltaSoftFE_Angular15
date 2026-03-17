import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceGroupComponent } from './advance-group.component';

describe('AdvanceGroupComponent', () => {
  let component: AdvanceGroupComponent;
  let fixture: ComponentFixture<AdvanceGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvanceGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
