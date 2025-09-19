import { createContext, useState, useContext, useEffect } from "react";
// import { searchMovies, getPopularMovies } from "../services/api";


const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
    // const [searchQuery, setSearchQuery] = useState("");
    // const [movies, setMovies] = useState([]);
    // const [error, setError] = useState(null);
    // const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem("favorites");
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }

    }, []);

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);


    const addToFavorites = (movie) => {
        setFavorites(prev => [...prev, movie]);

    };

    const removeFromFavorites = (movieId) => {
        setFavorites(prev => prev.filter(movie => movie.id !== movieId));
    };

    const checkIfFavorite = (movieId) => {
        return favorites.some(movie => movie.id === movieId);
    };

    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        checkIfFavorite
    }




    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );
}
