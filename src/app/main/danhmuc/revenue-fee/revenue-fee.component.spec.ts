import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueFeeComponent } from './revenue-fee.component';

describe('RevenueFeeComponent', () => {
  let component: RevenueFeeComponent;
  let fixture: ComponentFixture<RevenueFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
