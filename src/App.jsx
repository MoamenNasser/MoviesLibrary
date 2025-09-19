import './css/App.css'
import MovieCard from './components/MovieCard.jsx'
import Home from './pages/Home.jsx'
import {Routes, Route} from 'react-router-dom'
import Favorite from './pages/Favorites.jsx'
import NavBar from './components/NavBar.jsx'
import About from './pages/About.jsx'
import { MovieProvider } from './contexts/MovieContext.jsx'
// import Text from './Text.jsx'


// This is a component called App that renders a simple "Hello World" message.
function App() {
  // const [count, setCount] = useState(0);


  return (
    // <>
    //   <div>
    //     <a href="https://vite.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>
    //   <h1>Vite + React</h1>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.jsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">
    //     Click on the Vite and React logos to learn more
    //   </p>
    // </>

    // In JSX, you can return a single element
    // <div>Hello World</div>

    // In React, when returning multiple elements from a component,
    // you must return a single element
    // <div><h1>Hello World</h1></div>

    // to return multiple you must wrap them in a single parent element
    // <div>
    //   <h1>Hello World</h1>
    //   <h2>This is a subheading</h2>
    // </div>

    // or use React fragments
    // <>
    //   <div>
    //     <h1>Hello World</h1>
    //     <h2>This is a subheading</h2>

    //   </div>

    //   <div>
    //     <p>This paragraph will has my information</p>
    //   </div>
    // </>

    <>

      {/* <Text display="Hello World" />
      <Text display="This is a subheading" />
      <Text display="This paragraph will has my information" />

      <MovieCard
        movie={{
          url: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
          title: "The Dark Knight",
          year: "2008",
          type: "Action",
        }}
      /> */}


      <MovieProvider>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorite />} />
            <Route path="/about" element={<About />} />

          </Routes>
        </main>
      </MovieProvider>

      



    </>
  );
}


function Text({ display }) {
  return (
    <div>
      <p>{display}</p>
    </div>
  );
}



export default App


// export default function App() {
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Hello World</h1>
//       <p>Home page</p>
//     </div>
//   );
// }