import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCbtBc01Component } from './report-cbt-bc01.component';

describe('ReportCbtBc01Component', () => {
  let component: ReportCbtBc01Component;
  let fixture: ComponentFixture<ReportCbtBc01Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportCbtBc01Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportCbtBc01Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
