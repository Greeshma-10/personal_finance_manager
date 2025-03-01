import React from 'react';
import "./App.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Pages/Home/Home';
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";


const App = () => {
  return (
    
      <div className="App" style={{backgroundColor:'grey'}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
        </Routes>
      </BrowserRouter>
      </div>
  )
}

export default App