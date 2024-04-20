import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Navbar_temp: React.FC = () => {
  const [showSignupLogin, setShowSignupLogin] = useState(true);

  useEffect(() => {
    const currentURL = window.location.pathname;
    // Logic to toggle visibility based on the current URL
    if (currentURL === "/") {
      setShowSignupLogin(true); // Hide signup-login buttons on login/signup pages
    } else {
      setShowSignupLogin(false); // Show signup-login buttons on other pages
    }
  }, []);

  return (
    <div className="container-fluid">
      <nav
        className="navbar navbar-expand-sm navbar-light bg-light rounded  mb-5 shadow-sm"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
      >
        <Link
          to={
            window.location.pathname.includes("student-dashboard")
              ? "/student-dashboard/:id"
              : window.location.pathname.includes("teacher-dashboard")
              ? "/teacher-dashboard/:id"
              : window.location.pathname.includes("admin-dashboard")
              ? "/admin-dashboard"
              : "/"
          }
        >
          {" "}
          {/* Wrap the image with a Link component */}
          <img
            src="CCMS_Logo_4.png"
            alt=""
            style={{ width: "50px", height: "auto" }}
            className="me-3 ms-3"
          />
        </Link>
        <Link
          className="navbar-brand mx-auto"
          to={
            window.location.pathname.includes("student-dashboard")
              ? "/student-dashboard/:id"
              : window.location.pathname.includes("teacher-dashboard")
              ? "/teacher-dashboard/:id"
              : window.location.pathname.includes("admin-dashboard")
              ? "/admin-dashboard"
              : "/"
          }
          style={{ fontWeight: "bold" }}
        >
          CCMS
        </Link>
        {/* Signup and login buttons */}
        {showSignupLogin && (
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto me-4">
              <li className="nav-item">
                <Link className="nav-link" to="/signup">
                  Sign Up
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar_temp;
