import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbChitietCanonComponent } from './db-chitiet-canon.component';

describe('DbChitietCanonComponent', () => {
  let component: DbChitietCanonComponent;
  let fixture: ComponentFixture<DbChitietCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DbChitietCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DbChitietCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
