import { computed, Injectable, signal } from '@angular/core';
import { Movie } from '../../shared/models/movie.model';

/** Same key the React app used, so existing saved favorites carry over. */
const STORAGE_KEY = 'favorites';

function isMovie(value: unknown): value is Movie {
  if (typeof value !== 'object' || value === null) return false;
  const movie = value as Record<string, unknown>;
  return (
    typeof movie['id'] === 'number' &&
    typeof movie['title'] === 'string' &&
    typeof movie['year'] === 'string' &&
    (movie['url'] === null || typeof movie['url'] === 'string')
  );
}

/**
 * The user's favorite movies, persisted to localStorage.
 *
 * State lives in a signal. Persistence happens in the methods that change it,
 * never on startup, so loading can never overwrite saved data with an empty list
 * (the React version's two-effect approach could do that).
 */
@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly state = signal<readonly Movie[]>(this.load());

  readonly favorites = this.state.asReadonly();
  readonly count = computed(() => this.state().length);
  private readonly ids = computed(() => new Set(this.state().map((movie) => movie.id)));

  isFavorite(movieId: number): boolean {
    return this.ids().has(movieId);
  }

  add(movie: Movie): void {
    if (this.isFavorite(movie.id)) return;
    this.update([...this.state(), movie]);
  }

  remove(movieId: number): void {
    this.update(this.state().filter((movie) => movie.id !== movieId));
  }

  /** Adds the movie if absent, removes it if present. Returns whether it is now a favorite. */
  toggle(movie: Movie): boolean {
    if (this.isFavorite(movie.id)) {
      this.remove(movie.id);
      return false;
    }
    this.add(movie);
    return true;
  }

  private update(next: readonly Movie[]): void {
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      // Storage can be full or blocked (private mode); favorites then last for this session only.
      console.error('Could not save favorites:', error);
    }
  }

  private load(): Movie[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(isMovie) : [];
    } catch (error) {
      console.error('Could not read saved favorites:', error);
      return [];
    }
  }
}
