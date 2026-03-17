import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBc04Dt12Component } from './report-bc04-dt12.component';

describe('ReportBc04Dt12Component', () => {
  let component: ReportBc04Dt12Component;
  let fixture: ComponentFixture<ReportBc04Dt12Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportBc04Dt12Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBc04Dt12Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
