// Componentes de reseñas

import React from "react";
import { useState, useEffect, useRef } from "react";
import "../Styles/reviews.css";
import { FaThumbsUp, FaThumbsDown, FaComment } from "react-icons/fa";
import SummaryBar from "./SummaryBar";

function Reviews({ subject }) {
  const [reviews, setReviews] = useState([]);
  const email = sessionStorage.getItem("email");
  const id = sessionStorage.getItem("id");
  const [userReview, setUserReview] = useState("");
  const [userComment, setUserComment] = useState("");
  const reviewsEndRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summarizeText, setSummarizeText] = useState("");
  const [shouldScroll, setShouldScroll] = useState(false);
  const [loadingReaction, setLoadingReaction] = useState(null);
  const inputRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [currentReview, setCurrentReview] = useState(null);

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
        setShouldScroll(true);
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
      setLoadingReaction(review.id);

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
    } finally {
      setLoadingReaction(null);
    }
  }

  async function summarize() {
    try {
      const response = await fetch(
        `http://localhost:3000/openAIService/summarizeGEMINI/${subject.code}`,
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
    if (shouldScroll && reviewsEndRef.current) {
      reviewsEndRef.current.scrollTop = reviewsEndRef.current.scrollHeight;
      setShouldScroll(false);
    }
  }, [reviews]);

  // Hace que se traigan todas las reseñas de una materia cuando se renderiza el componente
  useEffect(() => {
    if (subject.code) {
      fetchReviews().then(() => {
        setShouldScroll(true);
      });
    }
  }, [subject.code]);

  function handleCommentClick(reviewId) {
    setReplyTo(reviewId);
    inputRef.current?.focus();
  }

  async function postComment() {
    if (!id) {
      return alert("Inicia sesión para poder publicar una reseña");
    }
    try {
      const response = await fetch(`http://localhost:3000/reviews/postComment`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idPublisher: id,
          content: userComment,
          idReview: currentReview.id,
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        await fetchReviews();
        setUserComment("");
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="content-summary">
      <div className={`subject-content ${showSummary ? "with-summary" : "full"}`}>
        <div className="tittle">
          <div className="tittle-content">
            <h1>{subject.name}</h1>
            <h2> Reseñas </h2>
          </div>
          <button
            className="btn btn-outline-primary summary-button"
            onClick={() => {
              setShowSummary(true);
              /*  */
            }}
          >
            Resumir
          </button>
        </div>
        <div className="reviews" ref={reviewsEndRef}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-container">
                  <div className="review-content">
                    <p>{review.content}</p>
                    <p>
                      <small>Publicado por: {review.review_author_email}</small>
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
                      <button
                        className="like-button"
                        onClick={() => handleLikes("like", review)}
                      >
                        {loadingReaction === review.id ? (
                          <div className="spinner"></div>
                        ) : (<FaThumbsUp
                          color={review.liked === 1 ? "blue" : "gray"}/>
                        )}
                      </button>
                      <p>
                        <small>{review.likes_count}</small>
                      </p>
                    </div>
                    <div className="dislike-box">
                      <button
                        className="dislike-button"
                        onClick={() => handleLikes("dislike", review)}
                      >
                        {loadingReaction === review.id ? (
                          <div className="spinner"></div>
                        ) : (<FaThumbsDown
                          color={review.disliked === 1 ? "blue" : "gray"}/>
                        )}
                      </button>
                      <p>
                        <small>{review.dislikes_count}</small>
                      </p>
                    </div>
                    <div className="comment-box">
                      <button
                        className="dislike-button"
                        onClick={() => {
                          handleCommentClick(review.id);
                          setCurrentReview(review);
                        }}
                      >
                        {loadingReaction === review.id ? (
                          <div className="spinner"></div>
                        ) : (<FaComment
                          color={review.disliked === 1 ? "blue" : "gray"}/>
                        )}
                      </button>
                      <p>
                        <small>{review.dislikes_count}</small>
                      </p>
                    </div>
                  </div>
                </div>
                {review.comments && review.comments.length > 0 && (
                  <>
                    <div className="comments-section">
                      <div className="comments-content">
                        <h4>Comentarios</h4>
                        {review.comments.map((comment, cIndex) => (
                          <div key={cIndex} className="comment-item">
                            <p>{comment.content}</p>
                            <p>
                              <small>Por: {comment.authorEmail}</small>
                              <br />
                              <small>
                                {new Date(comment.postDate).toLocaleString("es-CO", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="reaction-box">
                        <div className="like-box">
                          <button
                            className="like-button"
                            onClick={() => handleLikes("like", review)}
                          >
                            {loadingReaction === review.id ? (
                              <div className="spinner"></div>
                            ) : (<FaThumbsUp
                              color={review.liked === 1 ? "blue" : "gray"}/>
                            )}
                          </button>
                          <p>
                            <small>{review.likes_count}</small>
                          </p>
                        </div>
                        <div className="dislike-box">
                          <button
                            className="dislike-button"
                            onClick={() => handleLikes("dislike", review)}
                          >
                            {loadingReaction === review.id ? (
                              <div className="spinner"></div>
                            ) : (<FaThumbsDown
                              color={review.disliked === 1 ? "blue" : "gray"}/>
                            )}
                          </button>
                          <p>
                            <small>{review.dislikes_count}</small>
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p> No se han publicado reseñas por el momento </p>
          )}
        </div>
        <div className="post-review">
          {replyTo && (
            <div className="replyTo-container">
              <p>Contestando a {currentReview.review_author_email}</p>
              <button 
                className="close-replyTo-button"
                onClick={() => {
                  setReplyTo(null);
                  setCurrentReview(null);
                }}
              >
                x
              </button>
            </div>
          )}
          <input
            type="text"
            ref={inputRef}
            placeholder={replyTo ? "Escribe tu comentario" : "Escribe una reseña"}
            className=""
            value={replyTo ? userComment : userReview}
            onChange={(e) => {
              if(replyTo) {
                setUserComment(e.target.value);
              } else {
                setUserReview(e.target.value);
              }
            }}
          />
          <button 
            className="btn btn-primary pb" 
            onClick={() => {
              replyTo ? postComment() : postReview();
            }}
          > 
            Publicar 
          </button>
        </div>
      </div>
      {showSummary && <SummaryBar 
      summarizeText = {summarizeText}
      onClose={() => setShowSummary(false)} />}
    </div>
  );
}

export default Reviews;
