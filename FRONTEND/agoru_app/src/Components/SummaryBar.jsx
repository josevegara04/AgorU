// Componente de la barra de resumen de las reseñas de cada materia

import React from "react";
import { useState } from "react";
import "../Styles/SummaryBar.css";
import ReactMarkdown from "react-markdown";

function SummaryBar({ onClose, summarizeText}) {
    

  return (
    <div className="summary-bar">
      <button className="btn btn-primary close-summary-button" onClick={onClose}>
        x
      </button>
      <h1>Resumen</h1>
      <div className="summary-text">
        <ReactMarkdown>{summarizeText}</ReactMarkdown>
      </div>
    </div>
  );
}

export default SummaryBar;
