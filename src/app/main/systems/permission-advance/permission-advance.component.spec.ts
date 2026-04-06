import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionAdvanceComponent } from './permission-advance.component';

describe('PermissionAdvanceComponent', () => {
  let component: PermissionAdvanceComponent;
  let fixture: ComponentFixture<PermissionAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionAdvanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
