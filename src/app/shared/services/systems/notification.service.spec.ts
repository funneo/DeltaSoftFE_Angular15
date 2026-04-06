import { TestBed } from '@angular/core/testing';

import { FirebaseNotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: FirebaseNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
