import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/style.css";
import Navbar_temp from "./Navbar_temp";

const customStyles = {
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  borderRadius: "5px 5px 5px 5px",
};

const AdminLoginForm = () => {
  const [password, setPassword] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleClickSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/admin-login",
        { password }
      );

      if (response.status === 200) {
        // Navigate to the admin dashboard upon successful authentication
        navigate(`/admin-dashboard`);
      } else {
        // Handle case where admin authentication failed (e.g., show error message)
        alert("Incorrect password");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const navigate = useNavigate();

  return (
    <div
      className="container-fluid vh-100"
      style={{
        backgroundImage: `url('bg_1.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar_temp />
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-md-10">
          <div className="card shadow w-75 mx-auto" style={customStyles}>
            <div className="row g-0">
              {/* form */}
              <div className="col-md-7">
                <div className="card-body mt-3 mb-2">
                  <h2 className="card-title mb-4">Admin Login</h2>
                  <form onSubmit={handleClickSubmit}>
                    <div className="mb-3">
                      <input
                        type="password"
                        placeholder="Password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="btn btn-success mt-2"
                        style={{ backgroundColor: "#005a5a" }}
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {/* logo */}
              <div
                className="col-md-5 d-flex justify-content-center align-items-center"
                style={customStyles}
              >
                <img
                  src="CCMS_Logo_4.png"
                  className="img-fluid"
                  alt="Descriptive Alt Text"
                  style={{ width: "300px", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
