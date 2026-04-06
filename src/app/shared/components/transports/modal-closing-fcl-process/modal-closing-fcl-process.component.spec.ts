import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClosingFclProcessComponent } from './modal-closing-fcl-process.component';

describe('ModalClosingFclProcessComponent', () => {
  let component: ModalClosingFclProcessComponent;
  let fixture: ComponentFixture<ModalClosingFclProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalClosingFclProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalClosingFclProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
