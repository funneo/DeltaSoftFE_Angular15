import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWorkflowCanonComponent } from './modal-workflow-canon.component';

describe('ModalWorkflowCanonComponent', () => {
  let component: ModalWorkflowCanonComponent;
  let fixture: ComponentFixture<ModalWorkflowCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalWorkflowCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalWorkflowCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
