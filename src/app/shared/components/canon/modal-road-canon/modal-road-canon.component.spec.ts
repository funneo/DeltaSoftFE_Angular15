import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRoadCanonComponent } from './modal-road-canon.component';

describe('ModalRoadCanonComponent', () => {
  let component: ModalRoadCanonComponent;
  let fixture: ComponentFixture<ModalRoadCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRoadCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRoadCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
