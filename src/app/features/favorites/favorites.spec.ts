import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '../../core/services/notification.service';
import { Movie } from '../../shared/models/movie.model';
import { Favorites } from './favorites';

const heat: Movie = { id: 1, title: 'Heat', year: '1995', url: null };

describe('Favorites', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<Favorites>;

  async function render(saved: Movie[]) {
    localStorage.setItem('favorites', JSON.stringify(saved));
    TestBed.configureTestingModule({
      providers: [{ provide: NotificationService, useValue: { notify: vi.fn() } }],
    });
    fixture = TestBed.createComponent(Favorites);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  afterEach(() => localStorage.clear());

  it('shows the empty state when there are no favorites', async () => {
    await render([]);

    expect(element.querySelector('.favorites-empty h1')?.textContent).toBe(
      'No favorites added yet',
    );
    expect(element.querySelector('app-movie-card')).toBeNull();
  });

  it('lists saved favorites', async () => {
    await render([heat]);

    expect(element.querySelector('h1')?.textContent).toBe('your favorite movies');
    expect(element.querySelectorAll('app-movie-card')).toHaveLength(1);
    expect(element.querySelector('.favorites-empty')).toBeNull();
  });

  it('switches to the empty state when the last favorite is removed', async () => {
    await render([heat]);

    element.querySelector('button')?.click();
    await fixture.whenStable();

    expect(element.querySelector('.favorites-empty')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem('favorites') ?? 'null')).toEqual([]);
  });
});
