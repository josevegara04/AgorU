// Componente de la barra de resumen de las reseñas de cada materia

import React from "react";
import { useState } from "react";
import "../Styles/SummaryBar.css";

function SummaryBar({ onClose }) {
    const [summarizeText, setSummarizeText] = useState("");

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
        setSummarizeText("No hay reseñas")
      } else if (response.status === 403) {
        console.log(data.message);
      } else {
        setSummarizeText(data)
      }
    } catch (error) {
      console.error(error);
    }
  }

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
