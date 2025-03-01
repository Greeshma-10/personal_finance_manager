// NavbarComponent.js
import React, { useCallback, useEffect, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import "./style.css";
import { useNavigate } from 'react-router-dom';
// import Particles from "react-tsparticles";
// import { loadFull } from "tsparticles";
const Header = () => {
  
const navigate = useNavigate();

  const handleShowLogin = () =>{
    navigate("/login");
  }

  const [user, setUser] = useState();

  useEffect(() => {
    
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        
        setUser(user);
        
      }


    
  }, []);

  const handleShowLogout = () => {
    console.log("Before logout, token:", localStorage.getItem("token"));
    localStorage.removeItem("token");  // Clear token
    
    console.log("After logout, token:", localStorage.getItem("token"));

    navigate("/login", { replace: true });
    window.location.reload();  // ⬅ Force reload to reset state
};


  const particlesInit = useCallback(async (engine) => {
    // console.log(engine);
    //await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // await console.log(container);
  }, []);
  
  return (
    <>
    <div style={{ position: 'relative', overflow: 'hidden' }}>
    
    <Navbar className="navbarCSS" collapseOnSelect expand="lg" style={{position: 'relative', zIndex: "2 !important"}}>
      {/* <Navbar className="navbarCSS" collapseOnSelect expand="lg" bg="dark" variant="dark"> */}
        <Navbar.Brand href="/"  style={{ color: "#2D336B" }}className="text-white navTitle">Personal Finance Manager</Navbar.Brand>
        <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            style={{
              color:"#2D336B",
              backgroundColor: "transparent",
              borderColor: "transparent",
            }}
          >
            <span
              className="navbar-toggler-icon"
              style={{
                background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`,
              }}
            ></span>
          </Navbar.Toggle>
        <div>
        <Navbar.Collapse id="responsive-navbar-nav" style={{color: "white"}}>
          {user ? (
            <>
            <Nav>
                <Button variant="primary" onClick={handleShowLogout} className="ml-2">Logout</Button>
              </Nav>
            </>
          ) : (

            <>
              <Nav>
                <Button variant="primary" onClick={handleShowLogin} className="ml-2">Login</Button>
              </Nav>
            </>
          )}
          
        </Navbar.Collapse>
      </div>
      </Navbar>
      </div>
    </>
  );
};

export default Header;
