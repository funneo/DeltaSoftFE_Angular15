import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceCbtComponent } from './advance-cbt.component';

describe('AdvanceCbtComponent', () => {
  let component: AdvanceCbtComponent;
  let fixture: ComponentFixture<AdvanceCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvanceCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
