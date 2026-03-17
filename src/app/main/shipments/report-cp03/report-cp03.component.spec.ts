import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCp03Component } from './report-cp03.component';

describe('ReportCp03Component', () => {
  let component: ReportCp03Component;
  let fixture: ComponentFixture<ReportCp03Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportCp03Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportCp03Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
