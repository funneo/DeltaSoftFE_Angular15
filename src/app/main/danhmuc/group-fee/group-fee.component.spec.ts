import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupFeeComponent } from './group-fee.component';

describe('GroupFeeComponent', () => {
  let component: GroupFeeComponent;
  let fixture: ComponentFixture<GroupFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
