import "../css/Favorites.css"
import { useMovieContext } from "../contexts/MovieContext"
import MovieCard from "../components/MovieCard"

function Favorite() {
  const { favorites } = useMovieContext() // <-- use correct name

  if (favorites && favorites.length > 0) {
    return (
      <div className="favorites-page">
        <h2>your favorite movies</h2>
        <div className="favorites-grid">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-empty">
      <h2>No favorites added yet</h2>
      <p>Start adding movies to your favorites and they will appear here</p>
    </div>
  )
}

export default Favorite