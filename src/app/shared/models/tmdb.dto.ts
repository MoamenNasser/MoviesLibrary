/** The subset of a TMDB movie object this app reads. */
export interface TmdbMovieDto {
  id: number;
  title: string;
  release_date?: string | null;
  poster_path?: string | null;
}

/** Shape of TMDB's paged list endpoints (`/movie/popular`, `/search/movie`). */
export interface TmdbPageDto {
  results: TmdbMovieDto[];
}
