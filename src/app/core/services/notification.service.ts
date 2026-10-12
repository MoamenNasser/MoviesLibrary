import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/**
 * User-facing messages. Currently a blocking `alert()`, as in the React app;
 * keeping it behind a service means swapping in a toast touches only this file.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly window = inject(DOCUMENT).defaultView;

  notify(message: string): void {
    this.window?.alert(message);
  }
}
