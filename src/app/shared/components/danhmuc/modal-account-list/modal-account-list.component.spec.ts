import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAccountListComponent } from './modal-account-list.component';

describe('ModalAccountListComponent', () => {
  let component: ModalAccountListComponent;
  let fixture: ComponentFixture<ModalAccountListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAccountListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
