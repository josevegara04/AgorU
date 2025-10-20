// Componente de inicio de sesión

import React from "react";
import "../Styles/Login.css";
import { useState } from "react";
import Register from "./Register"

function Login({ onSuccess, setUserEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Función que hace el login
  async function login() {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await response.json();

      if (response.status === 400) {
        alert(data.message);
      } else if(response.status === 403){
        alert("Inicia sesión"); 
      } else{
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("id", data.id);
        setUserEmail(email);
        onSuccess("home");
      }
    } catch (err) {
      alert("Tu sesión expiró. Inicia sesión.")
      console.error(err);
    }
  }
  return (
    <div className="login-window">
      <h1>LOGIN</h1>
      <div className="form-container">
        <form action={login} className="form">
          <div className="mb-3">
            <label for="exampleInputEmail1" class="form-label">Email</label>
            <input
              name="email"
              className="form-control"
              id="exampleInputEmail1" 
              aria-describedby="emailHelp"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label for="exampleInputPassword1" class="form-label">Contraseña</label>
            <input
              name="password"
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary login-button"> Iniciar Sesión </button>
        </form>
        <div className="register-section">
          <p> ¿No tienes cuenta?</p>
          <button className="btn btn-primary login-button"onClick={() => onSuccess("register")}> Registrar </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
