/**
 * A movie as the UI sees it.
 *
 * The field names (`url`, `year`) match the shape the React version stored in
 * localStorage, so favorites saved by the old app still load.
 */
export interface Movie {
  id: number;
  title: string;
  /** Four-digit release year, or an empty string when TMDB has no release date. */
  year: string;
  /** Absolute poster URL, or `null` when TMDB has no poster. */
  url: string | null;
}
