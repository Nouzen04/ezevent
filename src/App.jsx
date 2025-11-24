import './App.css'
import AdminPage from './pages/AdminPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { useEffect, useState } from 'react'
import { auth } from './firebase'



function App() {

  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });

 return (
  <Router>
    <div className="app">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <Routes>
            <Route
            path='/'
            element={user ? <Navigate to="/admin" /> : <LoginPage />}
            />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignUpPage />} />
            <Route path='/admin' element={<AdminPage />} />
          </Routes>
        </div>
      </div>
    </div>
  </Router>
 )
}
export default App
