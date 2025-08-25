// Componente de la barra principal

import React from "react";
import "../Styles/Navbar.css";

export default function Navbar({ onButtonClick, email }) {
  return (
    <nav className="navbar">
      <img src="../public/images/logo.png" alt="" className="" />
      <div className="fields">
        <button onClick={() => onButtonClick("home")}> Inicio </button>
        <button onClick={() => onButtonClick("subjects")}> Materias </button>
        {!email ? (
          <>
            <button onClick={() => onButtonClick("login")}>
              Iniciar Sesión
            </button>
            <button onClick={() => onButtonClick("register")}>
              Registrarse
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("email");
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
