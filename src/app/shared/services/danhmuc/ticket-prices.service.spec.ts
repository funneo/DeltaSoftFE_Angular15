import { TestBed } from '@angular/core/testing';

import { TicketPricesService } from './ticket-prices.service';

describe('TicketPricesService', () => {
  let service: TicketPricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketPricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
