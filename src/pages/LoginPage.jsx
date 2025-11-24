import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {auth} from "../firebase";


function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in successfully");
            window.location.href = "/admin";


        }catch (error){
            console.log(error.message);

            //display error message on screen
        }
    }


    return (
        <form onSubmit={handleSubmit}>
            <h3>Login</h3>

            <div className="mb-3">
                <label>Email Address</label>
                <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value = {email}
                onChange={(e) => setEmail(e.target.value)}
                ></input>
            </div>

            <div className="mb-3">
                <label>Password</label>
                <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </div>
            <p><a href="/signup">Register Here</a></p>

        </form>
    )
}

export default LoginPage;