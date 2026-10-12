import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-not-found',
  styles: `
    /* The global link color is 3.79:1 on the page background; inherit the text color instead. */
    a {
      color: inherit;
      text-decoration: underline;
    }
  `,
  template: `
    <section>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <a routerLink="/">Back to Home</a>
    </section>
  `,
})
export class NotFound {}
