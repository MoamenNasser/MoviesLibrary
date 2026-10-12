import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesStore } from '../../../core/services/favorites.store';
import { NotificationService } from '../../../core/services/notification.service';
import { Movie } from '../../models/movie.model';
import { MovieGrid } from './movie-grid';

const movies: Movie[] = [
  { id: 1, title: 'Heat', year: '1995', url: null },
  { id: 2, title: 'Alien', year: '1979', url: null },
];

describe('MovieGrid', () => {
  let fixture: ComponentFixture<MovieGrid>;
  let element: HTMLElement;
  let notify: ReturnType<typeof vi.fn>;

  const buttonFor = (title: string) =>
    Array.from(element.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.includes(title),
    ) as HTMLButtonElement;

  beforeEach(async () => {
    localStorage.clear();
    notify = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: NotificationService, useValue: { notify } }],
    });
    fixture = TestBed.createComponent(MovieGrid);
    fixture.componentRef.setInput('movies', movies);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('renders one card per movie', () => {
    const titles = Array.from(element.querySelectorAll('h2')).map((h) => h.textContent);
    expect(titles).toEqual(['Heat', 'Alien']);
  });

  it('adds a movie to favorites, notifies, and flips the card to its favorited state', async () => {
    buttonFor('Heat').click();
    await fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).isFavorite(1)).toBe(true);
    expect(notify).toHaveBeenCalledExactlyOnceWith('Added to favorites!');
    expect(buttonFor('Heat').getAttribute('aria-pressed')).toBe('true');
    expect(buttonFor('Alien').getAttribute('aria-pressed')).toBe('false');
  });

  it('removes a favorited movie and notifies', async () => {
    buttonFor('Heat').click();
    await fixture.whenStable();
    notify.mockClear();

    buttonFor('Heat').click();
    await fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).isFavorite(1)).toBe(false);
    expect(notify).toHaveBeenCalledExactlyOnceWith('Removed from favorites!');
  });
});
