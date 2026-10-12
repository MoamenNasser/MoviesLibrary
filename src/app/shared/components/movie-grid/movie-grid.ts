import { Component, inject, input } from '@angular/core';
import { FavoritesStore } from '../../../core/services/favorites.store';
import { NotificationService } from '../../../core/services/notification.service';
import { Movie } from '../../models/movie.model';
import { MovieCard } from '../movie-card/movie-card';

/**
 * Responsive grid of movie cards. Shared by Home and Favorites, which both need
 * identical favorite-toggle behaviour, so that wiring lives here once.
 */
@Component({
  imports: [MovieCard],
  selector: 'app-movie-grid',
  styleUrl: './movie-grid.css',
  templateUrl: './movie-grid.html',
})
export class MovieGrid {
  readonly movies = input.required<readonly Movie[]>();

  protected readonly favorites = inject(FavoritesStore);
  private readonly notifications = inject(NotificationService);

  protected toggleFavorite(movie: Movie): void {
    const added = this.favorites.toggle(movie);
    this.notifications.notify(added ? 'Added to favorites!' : 'Removed from favorites!');
  }
}
