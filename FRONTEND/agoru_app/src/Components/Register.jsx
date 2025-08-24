import React from "react";
import "../Styles/Register.css"
import { useState } from "react";


function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checkPass, setCheckPass] = useState("");

    function checkPassword(password, checkPass){
        if (password == checkPass) {
            return true;
        }
        return false;
    }

    function register() {
        if(checkPassword(password, checkPass) == false) {
            alert("password is not the same");
            return;
        }
        const url = "http://localhost:3000/register"
        const response = fetch(url, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
    }
    return(
        <div className="register-window">
            <form action={register}>
                <div>
                    <label htmlFor="">Email</label>
                    <input name="email" type="email" value={ email } onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="">Contraseña</label>
                    <input name = "password" type="password" value={password} onChange={(e) => 
                        setPassword(e.target.value)
                    }/>
                </div>
                <div>
                    <label htmlFor="">Confirmar contraseña</label>
                    <input type="password" value={checkPass} onChange={(e) => {setCheckPass(e.target.value)}}/>
                </div>
                <button type="submit">Registrar</button>
            </form>
        </div>
    )
}

export default Register;