// Componente de la barra principal

import React from "react";
import "../Styles/Navbar.css";
import { FaUserCircle } from "react-icons/fa";
import {useState } from "react";

export default function Navbar({ onButtonClick, email }) {
  const [activeButton, setActiveButton] = useState("home"); // botón activo

  const handleClick = (section) => {
    setActiveButton(section);
    onButtonClick(section);
  };

  return (
    <nav className="navbar">
      <img src="../images/logo.png" alt="" className="" />
      <div className="fields">
        <button className={`btn btn-outline-primary nav-btn ${
            activeButton === "home" ? "active-btn" : ""
          }`} onClick={() => handleClick("home")}> Inicio </button>
        <button className={`btn btn-outline-primary nav-btn ${
            activeButton === "subjects" ? "active-btn" : ""
          }`} onClick={() => handleClick("subjects")}> Materias </button>
        {!email ? (
          <>
            <button className={`btn btn-outline-primary nav-btn ${
                activeButton === "login" ? "active-btn" : ""
              }`} onClick={() => handleClick("login")}>
              Iniciar Sesión
            </button>
            <button className={`btn btn-outline-primary nav-btn ${
                activeButton === "register" ? "active-btn" : ""
              }`} onClick={() => handleClick("register")}>
              Registrarse
            </button>
          </>
        ) : (
          <div class="dropdown">
            <button class="btn dropdown-toggle user-dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              {
                <>
                <FaUserCircle 
                  size={28}
                  className="user-icon"
                />
                  <span className="user-email">{email}</span>
                </>  
              }
            </button>
            <ul class="dropdown-menu dropdown-menu-end user-menu">
              <li><a className="dropdown-item user-item" href="#">Perfil</a></li>
              <li><button 
              className="dropdown-item user-item text-danger"
              onClick={() => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("email");
                sessionStorage.removeItem("id");
                window.location.reload();
              }}
              >Cerrar sesión</button></li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
