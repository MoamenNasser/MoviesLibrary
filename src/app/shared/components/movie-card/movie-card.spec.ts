import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Movie } from '../../models/movie.model';
import { MovieCard } from './movie-card';

const heat: Movie = { id: 1, title: 'Heat', year: '1995', url: 'https://img.test/heat.jpg' };

describe('MovieCard', () => {
  let fixture: ComponentFixture<MovieCard>;
  let element: HTMLElement;

  async function render(movie: Movie, favorite = false) {
    fixture = TestBed.createComponent(MovieCard);
    fixture.componentRef.setInput('movie', movie);
    fixture.componentRef.setInput('favorite', favorite);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  const button = () => element.querySelector('button') as HTMLButtonElement;

  it('shows the poster with the title as alt text, the title and the year', async () => {
    await render(heat);

    const img = element.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://img.test/heat.jpg');
    expect(img?.getAttribute('alt')).toBe('Heat');
    expect(element.querySelector('h2')?.textContent).toBe('Heat');
    expect(element.querySelector('.movie-details p')?.textContent).toBe('1995');
  });

  it('shows a placeholder instead of an image when there is no poster', async () => {
    await render({ ...heat, url: null });

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.poster-placeholder')?.textContent).toContain('No poster');
  });

  it('omits the year line when the year is unknown', async () => {
    await render({ ...heat, year: '' });
    expect(element.querySelector('.movie-details p')).toBeNull();
  });

  it('describes the favorite button for assistive technology in both states', async () => {
    await render(heat, false);
    expect(button().getAttribute('aria-label')).toBe('Add Heat to favorites');
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(button().classList).not.toContain('active');

    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();
    expect(button().getAttribute('aria-label')).toBe('Remove Heat from favorites');
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(button().classList).toContain('active');
  });

  it('emits favoriteToggle when the button is clicked', async () => {
    await render(heat);
    const emitted = vi.fn();
    fixture.componentInstance.favoriteToggle.subscribe(emitted);

    button().click();

    expect(emitted).toHaveBeenCalledTimes(1);
  });
});
