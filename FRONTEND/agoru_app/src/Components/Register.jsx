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
        localStorage.setItem("email", email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("id", data.id);
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
      <div className="form-container-register">
        <form onSubmit={register} className="form register">
          <div className="mb-3">
            <label for="exampleInputEmail1" class="form-label">Email</label>
            <input
              name="email"
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label for="exampleInputPassword1" class="form-label">Contraseña</label>
            <input
              name="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label for="exampleInputPassword1" class="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-control"
              value={checkPass}
              onChange={(e) => {
                setCheckPass(e.target.value);
              }}
            />
          </div>
          <button className="btn btn-primary login-button" type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
