import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowCanonComponent } from './workflow-canon.component';

describe('WorkflowCanonComponent', () => {
  let component: WorkflowCanonComponent;
  let fixture: ComponentFixture<WorkflowCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
