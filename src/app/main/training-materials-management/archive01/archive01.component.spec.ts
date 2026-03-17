import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Archive01Component } from './archive01.component';

describe('Archive01Component', () => {
  let component: Archive01Component;
  let fixture: ComponentFixture<Archive01Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Archive01Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Archive01Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
