import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Axios from "axios";
import "./App.css";

function App() {
  const [movieName, setMovieName] = useState("");
  const [review, setReview] = useState("");

  interface MovieReview {
    movieName: string;
    review: string;
  }
  const [movieList, setMovieList] = useState<MovieReview[]>([]);

  useEffect(() => {
    Axios.get("http://localhost:3000/api/get").then((response) => {
      setMovieList(response.data);
      console.log(response);
    });
  }, []);

  const submitReview = () => {
    Axios.post("http://localhost:3000/api/insert", {
      movieName: movieName,
      movieReview: review,
    }).then(() => {
      alert("successful insert");
    });
    setMovieList([...movieList, { movieName: movieName, review: review }]);
  };
  return (
    <>
      <h1>Movie Reviews</h1>
      <label className="movieName">name: </label>
      <input
        type="text"
        onChange={(e) => {
          setMovieName(e.target.value);
        }}
      />
      <label className="review">review: </label>
      <input
        type="text"
        onChange={(e) => {
          setReview(e.target.value);
        }}
      />
      <button onClick={submitReview}>Submit</button>
      {movieList.map((item, index) => {
        return (
          <div className="card" key={index}>
            <h1>{item.movieName}</h1>
            <p>{item.review}</p>
          </div>
        );
      })}
    </>
  );
}

export default App;
