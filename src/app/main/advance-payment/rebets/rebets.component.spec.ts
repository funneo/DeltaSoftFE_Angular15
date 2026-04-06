import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RebetsComponent } from './rebets.component';

describe('RebetsComponent', () => {
  let component: RebetsComponent;
  let fixture: ComponentFixture<RebetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RebetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RebetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
