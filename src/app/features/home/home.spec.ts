import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { Movie } from '../../shared/models/movie.model';
import { Home } from './home';

const movie = (id: number, title: string): Movie => ({ id, title, year: '2000', url: null });

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let element: HTMLElement;
  let popular: Subject<Movie[]>;
  let searchResults: Subject<Movie[]>[];
  let api: { getPopularMovies: ReturnType<typeof vi.fn>; searchMovies: ReturnType<typeof vi.fn> };

  const titles = () => Array.from(element.querySelectorAll('h2')).map((h) => h.textContent);
  const text = () => element.textContent ?? '';

  async function search(query: string) {
    const input = element.querySelector('input') as HTMLInputElement;
    input.value = query;
    input.dispatchEvent(new Event('input'));
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    popular = new Subject<Movie[]>();
    searchResults = [];
    api = {
      getPopularMovies: vi.fn(() => popular),
      searchMovies: vi.fn(() => {
        const results = new Subject<Movie[]>();
        searchResults.push(results);
        return results;
      }),
    };
    TestBed.configureTestingModule({ providers: [{ provide: TmdbApiService, useValue: api }] });
    fixture = TestBed.createComponent(Home);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows a loading message, then the popular movies', async () => {
    expect(text()).toContain('Loading...');
    expect(api.getPopularMovies).toHaveBeenCalledTimes(1);

    popular.next([movie(1, 'Heat'), movie(2, 'Alien')]);
    await fixture.whenStable();

    expect(text()).not.toContain('Loading...');
    expect(titles()).toEqual(['Heat', 'Alien']);
  });

  it('shows an error message when popular movies fail to load', async () => {
    popular.error(new Error('network'));
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toBe(
      'Failed to load popular movies. Please try again later.',
    );
    expect(element.querySelector('app-movie-card')).toBeNull();
  });

  it('searches with the trimmed query and shows the results', async () => {
    popular.next([movie(1, 'Heat')]);
    await fixture.whenStable();

    await search('  spider  ');
    expect(api.searchMovies).toHaveBeenCalledExactlyOnceWith('spider');
    expect(text()).toContain('Loading...');

    searchResults[0].next([movie(9, 'Spider-Man')]);
    await fixture.whenStable();
    expect(titles()).toEqual(['Spider-Man']);
  });

  it('ignores a blank search', async () => {
    popular.next([movie(1, 'Heat')]);
    await fixture.whenStable();

    await search('   ');

    expect(api.searchMovies).not.toHaveBeenCalled();
    expect(titles()).toEqual(['Heat']);
  });

  it('says so when a search finds nothing', async () => {
    popular.next([]);
    await search('zzzz');
    searchResults[0].next([]);
    await fixture.whenStable();

    expect(text()).toContain('No movies found.');
  });

  it('shows a search-specific error message when a search fails', async () => {
    popular.next([movie(1, 'Heat')]);
    await search('spider');
    searchResults[0].error(new Error('network'));
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toBe(
      'Failed to search movies. Please try again later.',
    );
  });

  // Regression: with plain async calls, a slow first response could overwrite a newer one.
  it('discards a slow earlier search that finishes after a newer one', async () => {
    popular.next([]);
    await search('first');
    await search('second');

    searchResults[1].next([movie(2, 'Second Result')]);
    await fixture.whenStable();
    searchResults[0].next([movie(1, 'Stale Result')]);
    await fixture.whenStable();

    expect(titles()).toEqual(['Second Result']);
  });

  it('labels the search field for screen readers', () => {
    const input = element.querySelector('input') as HTMLInputElement;
    const label = element.querySelector(`label[for="${input.id}"]`);
    expect(label?.textContent).toBe('Search movies');
  });
});
