// Componente de la barra de resumen de las reseñas de cada materia

import React from "react";
import { useState } from "react";
import "../Styles/SummaryBar.css";

function SummaryBar({ onClose, summarizeText}) {
    

  return (
    <div className="summary-bar">
      <button className="close-summary-button" onClick={onClose}>
        x
      </button>
      <h1>Resumen</h1>
      <div className="summary-text">
        <p>{summarizeText}</p>
      </div>
    </div>
  );
}

export default SummaryBar;
