import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPermissionCsComponent } from './modal-permission-cs.component';

describe('ModalPermissionCsComponent', () => {
  let component: ModalPermissionCsComponent;
  let fixture: ComponentFixture<ModalPermissionCsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPermissionCsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPermissionCsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
