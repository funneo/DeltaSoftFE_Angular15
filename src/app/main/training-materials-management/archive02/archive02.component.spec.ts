import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Archive02Component } from './archive02.component';

describe('Archive02Component', () => {
  let component: Archive02Component;
  let fixture: ComponentFixture<Archive02Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Archive02Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Archive02Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
