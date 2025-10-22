// Componentes de material de estudio

import React from "react";
import "../Styles/studyMaterial.css";

function studyMaterial({ subject }){
    return(
        <div className="subject-material">
            <div className="tittle">
                <div className="tittle-content">
                    <h1>{subject.name}</h1>
                    <h2> Material de estudio </h2>
                </div>
            </div>
        </div>
    )
};

export default studyMaterial;