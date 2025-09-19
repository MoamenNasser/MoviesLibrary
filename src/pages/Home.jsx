import MovieCard from "../components/MovieCard"
import { useState, useEffect } from "react"
import { searchMovies, getMovieDetails, getPopularMovies } from "../services/api"

import "../css/Home.css"

function Home()
{
    const [searchQuery, setSearchQuery] = useState("");
    // dynamic movie data from API
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    // useEffect is a hook that allows you to perform side effects in function components
    // It takes two arguments: a function and an array of dependencies
    // The function is called after the component renders
    // The array of dependencies determines when the function is called
    // If the array is empty, the function is called once when the component mounts
    // If the array contains values, the function is called whenever those values change
    useEffect(() => {
        const loadPopularMovies = async () => {
            try{
                const popularMovies = await getPopularMovies();
                setMovies(popularMovies);
                setError(null);
            } catch (error) {
                console.error("Error loading popular movies:", error);
                setError("Failed to load popular movies. Please try again later.");
            } finally {
                setLoading(false); // <- ensure loading is cleared
            }
        };
        loadPopularMovies();
    }, []);

    const handleSearch = async (event) => {
      event.preventDefault();
      if(!searchQuery.trim()) return;

      setLoading(true);
      try{
        const results = await searchMovies(searchQuery);
        setMovies(results);
        setError(null);
      }catch(error){
        console.error("Error searching movies:", error);
        setError("Failed to search movies. Please try again later.");
      }finally{
        setLoading(false);
      }
    };

    
    return (
      <>
        <div className="home">
          <form onSubmit={handleSearch} className="search-form">
            <input
              name="searchInput"            // <- add name
              type="text"
              placeholder="Search movies..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button type="submit" className="search-button">
              Search
            </button>
          </form>
          {loading ? (
            <div className="loading">Loading...</div>) : (
          <div className="movies-grid">  {/* use consistent className */}
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>)}

          {error && <div className="error-message">{error}</div>}
        </div>
      </>
    );

}

export default Home;

