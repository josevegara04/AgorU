// Componente de materias

import React from "react";
import "../Styles/Subjects.css";
import { useState } from "react";
import Reviews from "./Reviews";
import StudyMaterial from "./StudyMaterial";

function Subjects({ email }) {
  const subjects = {
    "Semestre 1": [
      { code: "1", name: "Cálculo 1" },
      { code: "2", name: "Fundamentos de Programación" },
      { code: "3", name: "Bienestar Universitario" },
      { code: "4", name: "Principios de Desarrollo de Software" },
      { code: "5", name: "Seminario de Ingenieria de Sistemas" },
      { code: "6", name: "Lógica" },
    ],
    "Semestre 2": [
      { code: "7", name: "Cálculo 2" },
      { code: "8", name: "Física 1" },
      { code: "9", name: "Estructuras Discretas" },
      { code: "10", name: "Lenguajes de Programación" },
      { code: "11", name: "Estructuras de Datos y Algoritmos 1" },
    ],
    "Semestre 3": [
      { code: "12", name: "Cálculo 3" },
      { code: "13", name: "Física 2" },
      { code: "14", name: "Base de datos" },
      { code: "15", name: "Estructuras de Datos y Algoritmos 2" },
      { code: "16", name: "Electrónica Digital" },
      { code: "17", name: "Lenguajes Formales y Compiladores" },
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
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    key={subject.code}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setSearchTerm(""); // limpiar búsqueda al seleccionar
                    }}
                  >
                    {subject.name}
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
                    <React.Fragment key={subject.code}>
                      <li
                        className={subject.name === selectedSubject.name ? "active" : ""}
                        onClick={() => setSelectedSubject(subject)}
                      >
                        {subject.name}
                      </li>
                      {subject.name === selectedSubject.name && (
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
      {resource === "studyMaterial" ? (
        <StudyMaterial subject={selectedSubject} />
      ) : (
        <Reviews subject={selectedSubject} />
      )}
    </div>
  );
}

export default Subjects;
