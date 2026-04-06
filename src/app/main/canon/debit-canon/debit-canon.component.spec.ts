import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitCanonComponent } from './debit-canon.component';

describe('DebitCanonComponent', () => {
  let component: DebitCanonComponent;
  let fixture: ComponentFixture<DebitCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebitCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebitCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
