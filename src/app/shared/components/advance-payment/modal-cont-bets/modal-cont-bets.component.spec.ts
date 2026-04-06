import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContBetsComponent } from './modal-cont-bets.component';

describe('ModalContBetsComponent', () => {
  let component: ModalContBetsComponent;
  let fixture: ComponentFixture<ModalContBetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalContBetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalContBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
