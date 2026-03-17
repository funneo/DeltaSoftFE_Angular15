import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtInventoryComponent } from './debt-inventory.component';

describe('DebtInventoryComponent', () => {
  let component: DebtInventoryComponent;
  let fixture: ComponentFixture<DebtInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
