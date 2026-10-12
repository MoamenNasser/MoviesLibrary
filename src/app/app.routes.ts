import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Movie List',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'favorites',
    title: 'Favorites | Movie List',
    loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
  },
  {
    path: 'about',
    title: 'About | Movie List',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  {
    path: '**',
    title: 'Page not found | Movie List',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
