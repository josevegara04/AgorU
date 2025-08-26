// Componentes de reseñas

import React from "react";
import "../Styles/reviews.css";

function reviews({ subject }) {
  return (
    <div className="subject-content">
      <div className="title">
        <h1>{subject}</h1>
        <h2> Reseñas </h2>
      </div>
      <div className="reviews">

      </div>
      <div className="post-review">
        <input type="text" className="" />
        <button> publicar </button>
      </div>
    </div>
  );
}

export default reviews;
