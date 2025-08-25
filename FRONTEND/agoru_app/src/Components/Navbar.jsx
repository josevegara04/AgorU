// Componente de la barra principal

import React from "react";
import "../Styles/Navbar.css";

export default function Navbar({ onButtonClick, email }) {
  async function login() {
    const url = "http://localhost:3000";
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(response.json().message);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <nav className="navbar">
      <img src="../public/images/logo.jpg" alt="" className="" />
      <div className="fields">
        <button onClick={() => onButtonClick("home")}> Inicio </button>
        <a href="#">Materias</a>
        <a href="#">Reseñas</a>
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
