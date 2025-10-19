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
        <ReactMarkdown>{/* {summarizeText} */}Resumen generado: A continuación, se presenta un resumen del análisis de las opiniones proporcionadas sobre la materia "Cálculo 1":

---

## Resumen del Análisis de Reseñas de "Cálculo 1"

Las opiniones recopiladas son extremadamente breves y, en su mayoría, **positivas** o de carácter entusiasta/neutro.

### 1. Aspectos Positivos Destacados

Los estudiantes que ofrecieron comentarios explícitos sobre la materia expresaron una valoración alta:

* **Valor Intrínseco:** Se menciona que es una materia "muy valiosa en el semestre".
* **Calidad General:** Se califica directamente como "muy buena materia" y "buena materia".
* **Recomendación:** La materia es explícitamente "Recomendada".

### 2. Aspectos Negativos Identificados

**No se identificaron aspectos negativos específicos en las reseñas proporcionadas.** La dificultad, el método de enseñanza, o la carga de trabajo no fueron mencionados por ninguno de los participantes.

### 3. Opinión General

La opinión general sobre "Cálculo 1", basada en este conjunto limitado de datos, es **abrumadoramente positiva**. Las pocas respuestas son concisas y enfáticas en la calidad y el valor de la asignatura.

**Nota sobre las Respuestas Neutras/Informales:** Varias respuestas ("hola", "que bueno", "gas") sugieren entusiasmo o al menos una actitud favorable, aunque no aportan información específica sobre el contenido académico de la materia.</ReactMarkdown>
      </div>
    </div>
  );
}

export default SummaryBar;
