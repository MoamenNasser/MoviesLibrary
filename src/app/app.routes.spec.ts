import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { About } from './features/about/about';
import { Favorites } from './features/favorites/favorites';
import { Home } from './features/home/home';
import { NotFound } from './features/not-found/not-found';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    harness = await RouterTestingHarness.create();
  });

  it.each([
    ['/', Home, 'Movie List'],
    ['/favorites', Favorites, 'Favorites | Movie List'],
    ['/about', About, 'About | Movie List'],
  ])('lazy-loads the page for %s and sets the document title', async (url, page, title) => {
    const component = await harness.navigateByUrl(url);

    expect(component).toBeInstanceOf(page);
    expect(TestBed.inject(Title).getTitle()).toBe(title);
  });

  it.each(['/', '/favorites', '/about', '/does-not-exist'])(
    'renders exactly one level-one heading on %s',
    async (url) => {
      await harness.navigateByUrl(url);

      expect(harness.routeNativeElement?.querySelectorAll('h1')).toHaveLength(1);
    },
  );

  it('shows the not-found page, with a link home, for unknown URLs', async () => {
    const component = await harness.navigateByUrl('/does-not-exist');

    expect(component).toBeInstanceOf(NotFound);
    const homeLink = harness.routeNativeElement?.querySelector('a');
    expect(homeLink?.getAttribute('href')).toBe('/');
    expect(TestBed.inject(Title).getTitle()).toBe('Page not found | Movie List');
  });
});
