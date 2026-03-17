import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShippingtaskCsUpdateComponent } from './modal-shippingtask-cs-update.component';

describe('ModalShippingtaskCsUpdateComponent', () => {
  let component: ModalShippingtaskCsUpdateComponent;
  let fixture: ComponentFixture<ModalShippingtaskCsUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShippingtaskCsUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingtaskCsUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
