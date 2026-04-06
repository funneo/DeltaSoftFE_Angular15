import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCanonComponent } from './job-canon.component';

describe('JobCanonComponent', () => {
  let component: JobCanonComponent;
  let fixture: ComponentFixture<JobCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
