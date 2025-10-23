// Componente de la barra principal

import React from "react";
import "../Styles/Navbar.css";

export default function Navbar({ onButtonClick, email }) {
  return (
    <nav className="navbar">
      <img src="../images/logo.png" alt="" className="" />
      <div className="fields">
        <button className="btn btn-outline-primary" onClick={() => onButtonClick("home")}> Inicio </button>
        <button className="btn btn-outline-primary" onClick={() => onButtonClick("subjects")}> Materias </button>
        {!email ? (
          <>
            <button className="btn btn-outline-primary" onClick={() => onButtonClick("login")}>
              Iniciar Sesión
            </button>
            <button className="btn btn-outline-primary" onClick={() => onButtonClick("register")}>
              Registrarse
            </button>
          </>
        ) : (
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("email");
              sessionStorage.removeItem("id");
              window.location.reload();
            }}
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </nav>
  );
}
