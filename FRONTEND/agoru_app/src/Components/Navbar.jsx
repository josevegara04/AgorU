import React from "react";
import "../Styles/Navbar.css"

export default function Navbar() {
  async function login(){
    const url = "http://localhost:3000"
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
        <a href="#">
          Inicio
        </a>
        <a href="#">
          Materias
        </a>
        <a href="#">
          Reseñas
        </a>
        <button onClick={login}>
            Iniciar Sesión
        </button>
      </div>
    </nav>
  );
}
