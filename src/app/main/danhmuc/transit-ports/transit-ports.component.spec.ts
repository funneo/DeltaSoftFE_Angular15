import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitPortsComponent } from './transit-ports.component';

describe('TransitPortsComponent', () => {
  let component: TransitPortsComponent;
  let fixture: ComponentFixture<TransitPortsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransitPortsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransitPortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
