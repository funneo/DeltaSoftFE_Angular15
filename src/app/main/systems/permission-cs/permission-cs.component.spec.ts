import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionCsComponent } from './permission-cs.component';

describe('PermissionCsComponent', () => {
  let component: PermissionCsComponent;
  let fixture: ComponentFixture<PermissionCsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionCsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionCsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
