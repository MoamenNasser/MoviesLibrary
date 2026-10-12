import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { MovieGrid } from '../../shared/components/movie-grid/movie-grid';
import { Movie } from '../../shared/models/movie.model';

type MoviesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; movies: Movie[] };

const LOADING: MoviesState = { status: 'loading' };

/** Popular movies, replaced by search results when the user submits a query. */
@Component({
  imports: [ReactiveFormsModule, MovieGrid],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly api = inject(TmdbApiService);
  private readonly searches = new Subject<string>();

  protected readonly form = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
  });

  /**
   * `startWith(null)` triggers the initial popular-movies load. `switchMap` unsubscribes from
   * the previous request when a new search arrives, so a slow earlier response can never
   * overwrite a newer one.
   */
  protected readonly state = toSignal(
    this.searches.pipe(
      startWith(null),
      switchMap((query) => this.load(query)),
    ),
    { initialValue: LOADING },
  );

  protected onSearch(): void {
    const query = this.form.controls.query.value.trim();
    if (!query) return;
    this.searches.next(query);
  }

  private load(query: string | null): Observable<MoviesState> {
    const isSearch = query !== null;
    const request = isSearch ? this.api.searchMovies(query) : this.api.getPopularMovies();

    return request.pipe(
      map((movies): MoviesState => ({ status: 'loaded', movies })),
      startWith(LOADING),
      catchError((error: unknown) => {
        console.error(
          isSearch ? 'Error searching movies:' : 'Error loading popular movies:',
          error,
        );
        return of<MoviesState>({
          status: 'error',
          message: isSearch
            ? 'Failed to search movies. Please try again later.'
            : 'Failed to load popular movies. Please try again later.',
        });
      }),
    );
  }
}
