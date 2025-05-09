import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../css/Navbar.css"; // Import CSS
import logo from "/logo.png"; 

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navRef = useRef(null);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Hide navbar on Admin Dashboard
  if (location.pathname.includes("/admin")) return null;

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-container">
        {/* ✅ Logo beside title */}
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Logo" className="nav-logo-img" />
          <span className="nav-title">Sonia's Cooking</span>
        </Link>

        {/* 🔥 Modernized Hamburger Menu */}
        <div className={`hamburger ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* 🔥 Fixed Nav Links */}
        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
          {isLoggedIn ? (
            <li>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            <li>
              <Link to="/login" className="nav-login" onClick={() => setIsOpen(false)}>Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
