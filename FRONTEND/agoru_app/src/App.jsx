import './App.css'
import React from "react";
import Navbar from './Components/Navbar';

function App() {

  return (
    <>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <h1>Bienvenido a AgorU</h1>
        <p>Aquí va el contenido principal.</p>
      </main>
    </>
  )
}

export default App
