import { Component, computed, input, output } from '@angular/core';
import { Movie } from '../../models/movie.model';

/** Presentational card: shows a movie and reports favorite clicks; it owns no state. */
@Component({
  selector: 'app-movie-card',
  styleUrl: './movie-card.css',
  templateUrl: './movie-card.html',
})
export class MovieCard {
  readonly movie = input.required<Movie>();
  readonly favorite = input(false);
  readonly favoriteToggle = output<void>();

  protected readonly favoriteLabel = computed(
    () =>
      `${this.favorite() ? 'Remove' : 'Add'} ${this.movie().title} ${this.favorite() ? 'from' : 'to'} favorites`,
  );
}
