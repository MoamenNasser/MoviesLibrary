import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Movie } from '../../shared/models/movie.model';
import { TmdbPageDto } from '../../shared/models/tmdb.dto';
import { toMovie } from '../../shared/utils/tmdb-mapper';
import { TMDB_CONFIG } from '../config/tmdb.config';

/**
 * Data access for TMDB. Failures are propagated as observable errors so the
 * caller can show them (the React version swallowed them and returned `[]`).
 */
@Injectable({ providedIn: 'root' })
export class TmdbApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TMDB_CONFIG);

  getPopularMovies(): Observable<Movie[]> {
    return this.getMovies('/movie/popular', {});
  }

  searchMovies(query: string): Observable<Movie[]> {
    return this.getMovies('/search/movie', { query });
  }

  private getMovies(path: string, params: Record<string, string>): Observable<Movie[]> {
    return this.http
      .get<TmdbPageDto>(`${this.config.apiBaseUrl}${path}`, {
        params: { api_key: this.config.apiKey, ...params },
      })
      .pipe(map((page) => page.results.map((dto) => toMovie(dto, this.config.imageBaseUrl))));
  }
}
