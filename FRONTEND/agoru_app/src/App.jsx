import "./App.css";
import React from "react";
import Navbar from "./Components/Navbar";
import Register from "./Components/Register"
import Login from "./Components/Login";
import Home from "./Components/Home";
import Subjects from "./Components/Subjects";
import { useState, useEffect } from "react";

function App() {
  const [view, setView] = useState("home");
  const [userEmail, setUserEmail] = useState("");

  // Verifica si ya hay una sesión iniciada
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setUserEmail(sessionStorage.getItem("email"));
      setView("home");
      console.log("si")
    }
  }, []);

  return (
    <>
      {/* Componente navbar */}
      <Navbar 
      onButtonClick={setView}
      email={userEmail}
      />

      {/* Dependiendo de la variable view, se muestra un componente */}
      {view === "login" && (
        <Login 
        onSuccess={(x) => setView(x)}
        setUserEmail={setUserEmail}/>
      )}
      {view === "register" && (
        <Register 
        onSuccess={() => setView("home")} 
        setUserEmail={setUserEmail}
        />
      )}
      {view === "home" && <Home email={userEmail}/>}
      {view === "subjects" && <Subjects email={userEmail}/>}
    </>
  );
}

export default App;
