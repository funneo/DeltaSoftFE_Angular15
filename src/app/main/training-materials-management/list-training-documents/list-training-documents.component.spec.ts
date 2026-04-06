import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTrainingDocumentsComponent } from './list-training-documents.component';

describe('ListTrainingDocumentsComponent', () => {
  let component: ListTrainingDocumentsComponent;
  let fixture: ComponentFixture<ListTrainingDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListTrainingDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTrainingDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
