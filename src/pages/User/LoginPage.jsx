import React, { useState } from 'react'
import { auth, db } from '../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate, Link } from "react-router-dom";
import '../../css/LoginPage.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user role from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const role = userData.role;

                // Navigate based on role
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'organizer') {
                    navigate('/organizer');
                } else {
                    navigate('/participant/events');
                }
            } else {
                setError('User data not found.');
            }
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="halftone-bg"></div>
            <div className="auth-container">
                <div className="logo-section">
                    <p className="logo-text">EZEvent</p>
                </div>

                <h2>SIGN IN</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="tbhx-button auth-button">
                        LOGIN
                    </button>
                </form>

                <div className="auth-footer">
                    <p>DON'T HAVE AN ACCOUNT? <Link to="/signup">JOIN THE FUTURE</Link></p>
                </div>
            </div>
        </div>
    )
}
