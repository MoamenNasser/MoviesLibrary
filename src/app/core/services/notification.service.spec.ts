import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  it('shows the message with the window alert', () => {
    const alert = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: { alert } } }],
    });

    TestBed.inject(NotificationService).notify('Added to favorites!');

    expect(alert).toHaveBeenCalledExactlyOnceWith('Added to favorites!');
  });
});
