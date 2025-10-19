// Componentes de reseñas

import React from "react";
import { useState, useEffect, useRef } from "react";
import "../Styles/reviews.css";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import SummaryBar from "./SummaryBar";

function Reviews({ subject }) {
  const [reviews, setReviews] = useState([]);
  const email = sessionStorage.getItem("email");
  const id = sessionStorage.getItem("id");
  const [userReview, setUserReview] = useState("");
  const reviewsEndRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summarizeText, setSummarizeText] = useState("");

  // Función para mostrar las reviews de una materia
  async function fetchReviews() {
    try {
      const response = await fetch(
        `http://localhost:3000/reviews/getReviews/${subject.code}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUser: id,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 400) {
        setReviews([]);
      } else if (response.status === 403) {
        console.log(data.message);
      } else {
        setReviews(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Función para publicar una review
  async function postReview() {
    if (!id) {
      return alert("Inicia sesión para poder publicar una reseña");
    }
    try {
      const response = await fetch(`http://localhost:3000/reviews/postReview`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idPublisher: id,
          content: userReview,
          idSubject: subject.code,
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        await fetchReviews();
        setUserReview("");
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Función para manejar los likes y dislikes
  async function handleLikes(x, review) {
    if (!id) {
      return alert("Inicia sesión");
    }

    let field;

    if (x === "like") {
      field = "likes_count";
    } else {
      field = "dislikes_count";
    }

    try {
      const response = await fetch(
        `http://localhost:3000/reviews/handleLikes/review`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            change: field,
            idReview: review.id,
            idUser: id,
          }),
        }
      );

      const data = await response.json();
      if (response.status === 200) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function summarize() {
    try {
      const response = await fetch(
        `http://localhost:3000/openAIService/summarize/${subject.code}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUser: id,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 400) {
        setSummarizeText("No hay reseñas");
      } else if (response.status === 403) {
        console.log(data.message);
      } else {
        setSummarizeText(data.summary);
        console.log(summarizeText)
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Hace que se haga scroll hasta la última reseña publicada
  useEffect(() => {
    if (reviewsEndRef.current) {
      reviewsEndRef.current.scrollTop = reviewsEndRef.current.scrollHeight;
    }
  }, [reviews]);

  // Hace que se traigan todas las reseñas de una materia cuando es pulsada en el sidebar
  useEffect(() => {
    if (subject.code) {
      fetchReviews();
    }
  }, [subject.code]);

  return (
    <div className="content-summary">
      <div className="subject-content">
        <div className="tittle">
          <div className="tittle-content">
            <h1>{subject.name}</h1>
            <h2> Reseñas </h2>
          </div>
          <button
            className="summary-button"
            onClick={() => {
              setShowSummary(true);
              summarize();
            }}
          >
            Resumir
          </button>
        </div>
        <div className="reviews" ref={reviewsEndRef}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-content">
                  <p>{review.content}</p>
                  <p>
                    <small>Publicado por: {review.email}</small>
                  </p>
                  <p>
                    <small>
                      {new Date(review.postDate).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </small>
                    <br />
                    <small>
                      {new Date(review.postDate).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </p>
                </div>
                <div className="reaction-box">
                  <div className="like-box">
                    <p>
                      <small>{review.likes_count}</small>
                    </p>
                    <button
                      className="like-button"
                      onClick={() => handleLikes("like", review)}
                    >
                      <FaThumbsUp
                        color={review.liked === 1 ? "blue" : "gray"}
                      ></FaThumbsUp>
                    </button>
                  </div>
                  <div className="dislike-box">
                    <p>
                      <small>{review.dislikes_count}</small>
                    </p>
                    <button
                      className="dislike-button"
                      onClick={() => handleLikes("dislike", review)}
                    >
                      <FaThumbsDown
                        color={review.disliked === 1 ? "blue" : "gray"}
                      ></FaThumbsDown>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p> No se han publicado reseñas por el momento </p>
          )}
        </div>
        <div className="post-review">
          <input
            type="text"
            className=""
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
          />
          <button onClick={() => postReview()}> Publicar </button>
        </div>
      </div>
      {showSummary && <SummaryBar 
      summarizeText = {summarizeText}
      onClose={() => setShowSummary(false)} />}
    </div>
  );
}

export default Reviews;
