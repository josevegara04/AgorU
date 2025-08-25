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
    const token = localStorage.getItem("token");
    if (token) {
      setUserEmail(localStorage.getItem("email"));
      setView("home");
    }
  }, []);

  return (
    <>
      <Navbar 
      onButtonClick={setView}
      email={userEmail}
      />
      {view === "login" && (
        <Login 
        onSuccess={() => setView("home")}
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
