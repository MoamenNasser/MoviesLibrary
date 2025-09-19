import "../css/MovieCard.css"
import { useMovieContext } from "../contexts/MovieContext";

function MovieCard({movie})
{
    const { addToFavorites, checkIfFavorite, removeFromFavorites } = useMovieContext();
    const favorite = checkIfFavorite(movie.id);


    function onFavoriteClick(e) 
    {
        e.preventDefault();
        if (favorite) {
            removeFromFavorites(movie.id);
            alert('Removed from favorites!');
        } else {
            addToFavorites(movie);
            alert('Added to favorites!');
        }
    }


    // function onFavoriteClick



    return (
      <>
            
        <div className="movie-card">
          <div className="movie-poster">
            <img src={movie.url} alt={movie.title} />
            <div className="movie-overlay">
              <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                ❤️
              </button>
            </div>
          </div>

          <div className="movie-details">
            <h3>{movie.title}</h3>
            <p>{movie.year}</p>
            {movie.type && <p>{movie.type}</p>}
          </div>
        </div>
      </>

      //   <div className="movie-card">
      //     <div className="movie-poster">
      //       <img src={movie.url} alt={movie.title} />
      //       <div className="movie-overlay">
      //         <button className="favorite-btn" onClick={onFavoriteClick}>
      //           ❤️
      //         </button>
      //       </div>
      //     </div>

      //     <div className="movie-details">
      //       <h3>{movie.title}</h3>
      //       <p>{movie.year}</p>
      //       <p>{movie.type}</p>
      //     </div>

      //     <article className="movie-card">
      //       <div className="poster">
      //         <img src={movie.url} alt={movie.title} />
      //       </div>
      //       <div className="details">
      //         <h3>{movie.title}</h3>
      //         <p>{movie.year}</p>
      //       </div>
      //     </article>
      //     {/* <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400'} alt={movie.Title} />
      //         <div>
      //             <span>{movie.Type}</span>
      //             <h3>{movie.Title}</h3>
      //             <p>{movie.Year}</p>
      //         </div> */}
      //   </div>
    );
}



export default MovieCard;










