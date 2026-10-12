import { InjectionToken } from '@angular/core';

export interface TmdbConfig {
  apiBaseUrl: string;
  imageBaseUrl: string;
  apiKey: string;
}

/**
 * Connection settings for The Movie Database (TMDB).
 *
 * Provided through DI so tests can substitute their own values. The endpoints
 * are HTTPS (the React app used HTTP, which browsers block from an HTTPS site).
 *
 * NOTE: this key was committed in the original repository, so it is already
 * public. Any key shipped to a browser is readable by users; rotate it on TMDB.
 */
export const TMDB_CONFIG = new InjectionToken<TmdbConfig>('TMDB_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    apiBaseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    apiKey: '6e770f4b948d00939dfae29f1a19c569',
  }),
});
