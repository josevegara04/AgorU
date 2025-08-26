// Componentes de reseñas

import React from "react";
import { useState, useEffect, useRef } from "react";
import "../Styles/reviews.css";

function Reviews({ subject }) {
  const [reviews, setReviews] = useState([]);
  const email = localStorage.getItem("email");
  const id = localStorage.getItem("id");
  const [userReview, setUserReview] = useState("");
  const reviewsEndRef = useRef(null);

  async function fetchReviews() {
    try {
      const response = await fetch(
        `http://localhost:3000/reviews/${subject.code}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 400) {
        setReviews([]);
      } else {
        setReviews(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function postReview() {
    try {
      const response = await fetch(`http://localhost:3000/reviews/postReview`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  useEffect(() => {
    if(reviewsEndRef.current){
      reviewsEndRef.current.scrollTop = reviewsEndRef.current.scrollHeight;
    }
  }, [reviews]);

  useEffect(() => {
    if (subject.code) {
      fetchReviews();
    }
  }, [subject.code]);

  return (
    <div className="subject-content">
      <div className="title">
        <h1>{subject.name}</h1>
        <h2> Reseñas </h2>
      </div>
      <div className="reviews" ref={reviewsEndRef}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
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
  );
}

export default Reviews;
