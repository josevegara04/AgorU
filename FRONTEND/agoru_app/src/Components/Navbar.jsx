import React from "react";
import "../Styles/Navbar.css"

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="app-name">AgorU</h1>
      <div className="fields">
        <a href="#">
          Inicio
        </a>
        <a href="#">
          Materias
        </a>
        <a href="#">
          Reseñas
        </a>
        <button>
            Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
