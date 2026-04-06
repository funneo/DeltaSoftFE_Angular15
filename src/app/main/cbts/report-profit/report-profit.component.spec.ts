import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProfitComponent } from './report-profit.component';

describe('ReportProfitComponent', () => {
  let component: ReportProfitComponent;
  let fixture: ComponentFixture<ReportProfitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportProfitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportProfitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
