import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalJobCanonComponent } from './modal-job-canon.component';

describe('ModalJobCanonComponent', () => {
  let component: ModalJobCanonComponent;
  let fixture: ComponentFixture<ModalJobCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalJobCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalJobCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
