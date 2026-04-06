import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewScopeComponent } from './modal-view-scope.component';

describe('ModalViewScopeComponent', () => {
  let component: ModalViewScopeComponent;
  let fixture: ComponentFixture<ModalViewScopeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalViewScopeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewScopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
