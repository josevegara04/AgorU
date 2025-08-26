// Componente de materias

import React from "react";
import "../Styles/Subjects.css";
import { useState } from "react";
import Reviews from "./Reviews";
import StudyMaterial from "./StudyMaterial";

function Subjects({ email }) {
  const subjects = {
    "Semestre 1": [
      "Cálculo 1",
      "Fundamentos de Programación",
      "Bienestar Universitario",
      "Principios de Desarrollo de Software",
      "Seminario de Ingenieria de Sistemas",
      "Lógica",
    ],
    "Semestre 2": [
      "Cálculo 2",
      "Física 1",
      "Estructuras Discretas",
      "Lenguajes de Programación",
      "Estructuras de Datos y Algoritmos 1",
    ],
    "Semestre 3": [
      "Cálculo 3",
      "Física 2",
      "Base de datos",
      "Estructuras de Datos y Algoritmos 2",
      "Electrónica Digital",
      "Lenguajes Formales y Compiladores",
    ],
  };
  const [selectedSemester, setSelectedSemester] = useState("Semestre 1");
  const [selectedSubject, setSelectedSubject] = useState(
    subjects["Semestre 1"][0]
  );
  const [resource, setResource] = useState("studyMaterial");
  const [searchTerm, setSearchTerm] = useState("");
  const filteredSubjects = Object.values(subjects)
    .flat()
    .filter((subject) =>
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="subjects-container">
      <div className="subjects-sidebar">
        <div className="search">
          <label htmlFor="">Buscar</label>
          <input
            type="text"
            className=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ul className="search-results">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <li
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setSearchTerm(""); // limpiar búsqueda al seleccionar
                    }}
                  >
                    {subject}
                  </li>
                ))
              ) : (
                <li>No se encontraron materias</li>
              )}
            </ul>
          )}
        </div>
        <h2> Semestres </h2>
        <ul>
          {Object.keys(subjects).map((semester) => (
            <React.Fragment key={semester}>
              <li
                onClick={() => {
                  setSelectedSemester(semester);
                  setSelectedSubject(subjects[semester][0]);
                }}
                className={semester === selectedSemester ? "active" : ""}
              >
                {semester}
              </li>
              {semester === selectedSemester && (
                <ul>
                  {subjects[semester].map((subject) => (
                    <React.Fragment key={subject}>
                      <li
                        className={subject === selectedSubject ? "active" : ""}
                        onClick={() => setSelectedSubject(subject)}
                      >
                        {subject}
                      </li>
                      {subject === selectedSubject && (
                        <ul>
                          <li onClick={() => setResource("studyMaterial")}>
                            Material de estudio
                          </li>
                          <li onClick={() => setResource("reviews")}>
                            Reseñas
                          </li>
                        </ul>
                      )}
                    </React.Fragment>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      {resource === "studyMaterial" ? <StudyMaterial subject={selectedSubject}/> : <Reviews subject={selectedSubject}/>}
    </div>
  );
}

export default Subjects;
