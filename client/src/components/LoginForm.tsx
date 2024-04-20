import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/style.css";
import Navbar_temp from "./Navbar_temp";

interface Credentials {
  email: string;
  password: string;
}

const customStyles = {
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  borderRadius: "5px 5px 5px 5px",
};

const LoginForm = () => {
  const [Credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });

  const [role, setRole] = useState<string>("student");
  const [loginTitle, setLoginTitle] = useState<string>("Student Login");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleClickSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

      const response = await axios.post(
        "http://localhost:5000/login",
        { email: Credentials.email, password: Credentials.password, role }
      );
      console.log(Credentials.email);
      console.log(Credentials.password);
      console.log(role);


      // Extract userid from response data if available
      // console.log(userid);
      // Redirect to corresponding dashboard upon successful authentication
      // if (userid) {

      if (role === "teacher") {
        const { teacherid } = response.data;
        console.log(teacherid);
        navigate(`/teacher-dashboard/${teacherid}`); // Redirect to teacher dashboard
      } else if (role === "student") {
        const { studentid } = response.data;
        console.log(studentid);
        navigate(`/student-dashboard/${studentid}`); // Redirect to student dashboard
      }
      else {
        console.log("User does not exist");
        // Handle case where user does not exist (e.g., show error message)
      }
      // } 
      // else {
      //   console.log("User does not exist");
      //   // Handle case where user does not exist (e.g., show error message)
      // }
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();

  const handleClickSignUp = () => {
    navigate("/signup");
  };

  const handleClickRoleSwitch = () => {
    setRole((prevRole) => (prevRole === "student" ? "teacher" : "student"));
    setLoginTitle((prevTitle) =>
      prevTitle === "Student Login" ? "Teacher Login" : "Student Login"
    );
  };

  return (
    <div
      className="container-fluid flex-fill py-5"
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
                  <h2 className="card-title mb-4">{loginTitle}</h2>
                  <form onSubmit={handleClickSubmit}>
                    <div className="mb-3">
                      <input
                        placeholder="Email"
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={Credentials.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="password"
                        placeholder="Password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={Credentials.password}
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
                      <button
                        className="btn mt-2"
                        type="button"
                        onClick={handleClickRoleSwitch}
                      >
                        Switch to {role === "student" ? "teacher" : "student"}
                      </button>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                      <p className="clickable-text" onClick={handleClickSignUp}>
                        Don't have an account? Sign Up
                      </p>
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

export default LoginForm;
