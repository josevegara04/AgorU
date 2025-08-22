import React from "react";
import "../Styles/Navbar.css"

export default function Navbar() {
  return (
    <nav className="navbar">
      <img src="../public/images/logo.jpg" alt="" className="" />
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
