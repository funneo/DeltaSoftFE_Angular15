import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPermissionAdvanceComponent } from './modal-permission-advance.component';

describe('ModalPermissionAdvanceComponent', () => {
  let component: ModalPermissionAdvanceComponent;
  let fixture: ComponentFixture<ModalPermissionAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPermissionAdvanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPermissionAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
