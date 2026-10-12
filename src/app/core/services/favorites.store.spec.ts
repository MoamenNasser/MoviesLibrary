import { TestBed } from '@angular/core/testing';
import { Movie } from '../../shared/models/movie.model';
import { FavoritesStore } from './favorites.store';

const heat: Movie = { id: 1, title: 'Heat', year: '1995', url: 'https://img.test/heat.jpg' };
const alien: Movie = { id: 2, title: 'Alien', year: '1979', url: null };

const saved = () => JSON.parse(localStorage.getItem('favorites') ?? 'null');

/** A fresh store instance, as after a page reload. */
function reloadStore(): FavoritesStore {
  TestBed.resetTestingModule();
  return TestBed.inject(FavoritesStore);
}

describe('FavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('starts empty when nothing is saved', () => {
    const store = TestBed.inject(FavoritesStore);
    expect(store.favorites()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  it('adds a favorite, tracks it by id and persists it', () => {
    const store = TestBed.inject(FavoritesStore);
    store.add(heat);

    expect(store.favorites()).toEqual([heat]);
    expect(store.isFavorite(1)).toBe(true);
    expect(store.isFavorite(2)).toBe(false);
    expect(store.count()).toBe(1);
    expect(saved()).toEqual([heat]);
  });

  it('does not add the same movie twice', () => {
    const store = TestBed.inject(FavoritesStore);
    store.add(heat);
    store.add(heat);
    expect(store.favorites()).toEqual([heat]);
  });

  it('removes a favorite and persists the removal', () => {
    const store = TestBed.inject(FavoritesStore);
    store.add(heat);
    store.add(alien);
    store.remove(1);

    expect(store.favorites()).toEqual([alien]);
    expect(saved()).toEqual([alien]);
  });

  it('toggle adds then removes, and reports the resulting state', () => {
    const store = TestBed.inject(FavoritesStore);
    expect(store.toggle(heat)).toBe(true);
    expect(store.isFavorite(1)).toBe(true);
    expect(store.toggle(heat)).toBe(false);
    expect(store.isFavorite(1)).toBe(false);
  });

  // Regression: the React version wrote [] to localStorage on startup, which could wipe
  // saved favorites on reload.
  it('keeps saved favorites across a reload', () => {
    TestBed.inject(FavoritesStore).add(heat);

    const reloaded = reloadStore();

    expect(reloaded.favorites()).toEqual([heat]);
    expect(saved()).toEqual([heat]);
  });

  it('loads favorites saved in the format the React app used', () => {
    localStorage.setItem(
      'favorites',
      JSON.stringify([{ id: 5, title: 'Old', year: '2001', url: 'http://image.tmdb.org/x.jpg' }]),
    );
    expect(TestBed.inject(FavoritesStore).isFavorite(5)).toBe(true);
  });

  it('falls back to an empty list when saved data is not valid JSON', () => {
    localStorage.setItem('favorites', '{not json');
    expect(TestBed.inject(FavoritesStore).favorites()).toEqual([]);
  });

  it('ignores saved entries that are not movies', () => {
    localStorage.setItem('favorites', JSON.stringify([heat, { id: 'x' }, null, 'junk']));
    expect(TestBed.inject(FavoritesStore).favorites()).toEqual([heat]);
  });

  it('keeps working in memory when localStorage rejects writes', () => {
    const store = TestBed.inject(FavoritesStore);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    expect(() => store.add(heat)).not.toThrow();
    expect(store.isFavorite(1)).toBe(true);
  });
});
