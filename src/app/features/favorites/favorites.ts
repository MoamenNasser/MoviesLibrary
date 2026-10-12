import { Component, inject } from '@angular/core';
import { FavoritesStore } from '../../core/services/favorites.store';
import { MovieGrid } from '../../shared/components/movie-grid/movie-grid';

@Component({
  imports: [MovieGrid],
  selector: 'app-favorites',
  styleUrl: './favorites.css',
  templateUrl: './favorites.html',
})
export class Favorites {
  protected readonly store = inject(FavoritesStore);
}
