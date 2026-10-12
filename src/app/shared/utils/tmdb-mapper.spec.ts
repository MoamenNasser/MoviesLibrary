import { toMovie } from './tmdb-mapper';

const IMG = 'https://img.test/w500';

describe('toMovie', () => {
  it('maps a complete TMDB movie', () => {
    expect(
      toMovie({ id: 7, title: 'Se7en', release_date: '1995-09-22', poster_path: '/abc.jpg' }, IMG),
    ).toEqual({ id: 7, title: 'Se7en', year: '1995', url: 'https://img.test/w500/abc.jpg' });
  });

  it.each([undefined, null, ''])(
    'uses an empty year instead of throwing when release_date is %j',
    (releaseDate) => {
      const movie = toMovie({ id: 1, title: 'Untitled', release_date: releaseDate }, IMG);
      expect(movie.year).toBe('');
    },
  );

  it.each([undefined, null, ''])(
    'uses a null url instead of ".../w500null" when poster_path is %j',
    (posterPath) => {
      const movie = toMovie({ id: 1, title: 'Untitled', poster_path: posterPath }, IMG);
      expect(movie.url).toBeNull();
    },
  );
});
