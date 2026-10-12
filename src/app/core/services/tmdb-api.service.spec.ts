import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Movie } from '../../shared/models/movie.model';
import { TMDB_CONFIG } from '../config/tmdb.config';
import { TmdbApiService } from './tmdb-api.service';

describe('TmdbApiService', () => {
  let service: TmdbApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: TMDB_CONFIG,
          useValue: {
            apiBaseUrl: 'https://api.test/3',
            imageBaseUrl: 'https://img.test/w500',
            apiKey: 'KEY',
          },
        },
      ],
    });
    service = TestBed.inject(TmdbApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests popular movies with the API key and maps the results', () => {
    let result: Movie[] | undefined;
    service.getPopularMovies().subscribe((movies) => (result = movies));

    const req = http.expectOne((r) => r.url === 'https://api.test/3/movie/popular');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('api_key')).toBe('KEY');
    req.flush({
      results: [{ id: 1, title: 'Heat', release_date: '1995-12-15', poster_path: '/heat.jpg' }],
    });

    expect(result).toEqual([
      { id: 1, title: 'Heat', year: '1995', url: 'https://img.test/w500/heat.jpg' },
    ]);
  });

  it('searches with the query URL-encoded', () => {
    service.searchMovies('spider man & co').subscribe();

    const req = http.expectOne((r) => r.url === 'https://api.test/3/search/movie');
    expect(req.request.params.get('query')).toBe('spider man & co');
    expect(req.request.urlWithParams).toContain('query=spider%20man%20%26%20co');
    req.flush({ results: [] });
  });

  it('keeps the other results when one movie has no release date or poster', () => {
    let result: Movie[] | undefined;
    service.searchMovies('x').subscribe((movies) => (result = movies));

    http
      .expectOne((r) => r.url.endsWith('/search/movie'))
      .flush({
        results: [
          { id: 1, title: 'No Date', release_date: null, poster_path: '/a.jpg' },
          { id: 2, title: 'No Poster', release_date: '2001-01-01', poster_path: null },
        ],
      });

    expect(result?.map((m) => [m.title, m.year, m.url])).toEqual([
      ['No Date', '', 'https://img.test/w500/a.jpg'],
      ['No Poster', '2001', null],
    ]);
  });

  it('propagates HTTP failures to the caller instead of returning an empty list', () => {
    let error: unknown;
    service.getPopularMovies().subscribe({ error: (e: unknown) => (error = e) });

    http
      .expectOne((r) => r.url.endsWith('/movie/popular'))
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(500);
  });
});
