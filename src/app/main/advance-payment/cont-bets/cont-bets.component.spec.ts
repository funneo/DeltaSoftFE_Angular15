import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContBetsComponent } from './cont-bets.component';

describe('ContBetsComponent', () => {
  let component: ContBetsComponent;
  let fixture: ComponentFixture<ContBetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContBetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
