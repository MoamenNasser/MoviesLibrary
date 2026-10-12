import { Movie } from '../models/movie.model';
import { TmdbMovieDto } from '../models/tmdb.dto';

/**
 * Maps a TMDB movie to the app's `Movie`.
 *
 * Unlike the React version, a missing `release_date` or `poster_path` does not
 * throw (which used to discard the whole result list) or yield a `.../w500null` URL.
 */
export function toMovie(dto: TmdbMovieDto, imageBaseUrl: string): Movie {
  return {
    id: dto.id,
    title: dto.title,
    year: dto.release_date?.split('-')[0] ?? '',
    url: dto.poster_path ? `${imageBaseUrl}${dto.poster_path}` : null,
  };
}
