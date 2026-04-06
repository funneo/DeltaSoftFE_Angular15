import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalListContSealComponent } from './modal-list-cont-seal.component';

describe('ModalListContSealComponent', () => {
  let component: ModalListContSealComponent;
  let fixture: ComponentFixture<ModalListContSealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalListContSealComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalListContSealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
