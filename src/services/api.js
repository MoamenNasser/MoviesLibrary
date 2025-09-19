// This file will contain functions to interact with a backend API
// using fetch or axios for making HTTP requests.

const API_KEY = "6e770f4b948d00939dfae29f1a19c569";

const BASE_URL = "http://api.themoviedb.org/3";
const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/w500";


export const getPopularMovies = async () => {
    // const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);

    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date.split("-")[0],
            url: `${IMAGE_BASE_URL}${movie.poster_path}`
        }));
    } catch (error) {
        console.error("Error fetching popular movies:", error);
        return [];
    }
};

export const getMovieDetails = async (movieId) => {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);        
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return {
            id: data.id,
            title: data.title,
            year: data.release_date.split("-")[0],
            url: `${IMAGE_BASE_URL}${data.poster_path}`,
            overview: data.overview,
            rating: data.vote_average
        };
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
};

export const searchMovies = async (query) => {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date.split("-")[0],
            url: `${IMAGE_BASE_URL}${movie.poster_path}`
        }));
    } catch (error) {
        console.error("Error searching movies:", error);
        return [];
    }
};

export async function fetchMovies(query) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date.split("-")[0],
      url: `${IMAGE_BASE_URL}${movie.poster_path}`
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}
