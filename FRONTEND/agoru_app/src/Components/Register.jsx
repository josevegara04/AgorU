// Componente del registro

import React from "react";
import "../Styles/Register.css";
import { useState } from "react";

function Register({ onSuccess, setUserEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkPass, setCheckPass] = useState("");

  // Función que verifica si la contraseña se ha escrito bien
  function checkPassword(password, checkPass) {
    if (password == checkPass) {
      return true;
    }
    return false;
  }

  async function register(e) {
    e.preventDefault();
    if (!checkPassword(password, checkPass)) {
      alert("password is not the same");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setUserEmail(email);
        onSuccess(); 
      } else if (response.status === 400) {
        alert(data.message || "El email ya existe");
      } else {
        alert("Error inesperado: " + data.message);
      }
    } catch(err) {
      console.error("Error de red:", err);
    }
  }
  return (
    <div className="register-window">
      <h1>REGISTRO</h1>
      <div className="form">
        <form onSubmit={register}>
          <div>
            <label htmlFor="">Email</label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="">Contraseña</label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="">Confirmar contraseña</label>
            <input
              type="password"
              value={checkPass}
              onChange={(e) => {
                setCheckPass(e.target.value);
              }}
            />
          </div>
          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
