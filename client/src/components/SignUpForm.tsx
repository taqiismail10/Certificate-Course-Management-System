import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
import "../pages/style.css";
import axios from "axios";
import Navbar_temp from "./Navbar_temp";
// type Role = "student" | "teacher";

const customStyles = {
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  borderRadius: "5px 5px 5px 5px",
};

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  designation?: string;
}

const SignUpForm = () => {
  const [user, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
    designation: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleClickRole = () => {
    setUser((prevUser) => ({
      ...prevUser,
      role: prevUser.role === "student" ? "teacher" : "student",
    }));
  };

  const handleClickSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log(user);
      const response = await axios.post(
        "http://localhost:5000/signup",
        user
      );
      console.log(response.data.userId);
      if (user.role === "student") {
        navigate(`/student-dashboard/${response.data.userId}`);
      } else if (user.role === "teacher") {
        navigate(`/teacher-dashboard/${response.data.userId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();
  const handleClickLogin = () => {
    navigate("/login");
  };

  //deprecated
  // const [role, setRole] = useState("student");
  // const [designation, setDesignation] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  //deprecated
  // const handleRoleChange = () => {
  //   setRole(role === "student" ? "teacher" : "student");
  // };

  //deprecated
  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   try {
  //     const response = await axios.post("http://localhost:3000/api/signup", {
  //       firstName,
  //       lastName,
  //       email,
  //       password,
  //       role,
  //       ...(role === "teacher" && { designation }),
  //     });
  //     console.log(response.data);
  //     // alert('kaj krse')
  //     // Handle success (e.g., show a message, redirect, etc.)
  //   } catch (error) {
  //     console.error(error);
  //     // alert('kaj kore nai')
  //     // Handle error (e.g., show error message)
  //   }
  // };

  return (
    <div
      className="container-fluid flex-fill "
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
              {/* Column for the form */}
              <div className="col-md-7">
                <div className="card-body mt-3 mb-2 ">
                  <h2 className="card-title mb-4">Sign Up As a {user.role}</h2>
                  <form onSubmit={handleClickSubmit}>
                    <div className="mb-3">
                      {/* <label htmlFor="firstName" className="form-label">
                        First Name
                      </label> */}
                      <input
                        placeholder="First Name"
                        type="text"
                        className="form-control"
                        name="firstName"
                        id="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      {/* <label htmlFor="lastName" className="form-label">
                        Last Name
                      </label> */}
                      <input
                        placeholder="Last Name"
                        type="text"
                        name="lastName"
                        className="form-control"
                        id="lastName"
                        value = {user.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      {/* <label htmlFor="email" className="form-label">
                        Email
                      </label> */}
                      <input
                        placeholder="Email"
                        type="email"
                        name="email"
                        className="form-control"
                        id="email"
                        value = {user.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      {/* <label htmlFor="password" className="form-label">
                        Password
                      </label> */}
                      <input
                        type="password"
                        placeholder="password"
                        className="form-control"
                        name='password'
                        id="password"
                        value = {user.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {user.role === "teacher" && (
                      <div className="mb-3">
                        {/* <label htmlFor="designation" className="form-label">
                          Designation
                        </label> */}

                        <select
                          className="form-select"
                          aria-placeholder="hello"
                          id="designation"
                          name='designation'
                          value={user.designation}
                          onChange={handleChange}
                          required
                          >
                          {/* <option value="">Select Designation</option> */}
                          <option value="Select Designation">
                            Select Designation
                          </option>
                          <option value="Lecturer">Lecturer</option>
                          <option value="Assistant Professor">
                            Assistant Professor
                          </option>
                          <option value="Associate Professor">
                            Associate Professor
                          </option>
                          <option value="Professor">Professor</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <button
                        type="submit"
                        className="btn btn-success mt-2"
                        style={{ backgroundColor: "#005a5a" }}
                      >
                        Submit
                      </button>
                      {/* Clickable text to switch roles */}
                      {/* <div className="d-flex justify-content-between"> */}
                      <button
                        className="btn mt-2 mr-5"
                        type="button"
                        onClick={handleClickLogin}
                        style={{ color: "#005a5a" }}
                      >
                        Have an account? Login
                      </button>
                    </div>
                    {user.role === "student" && (
                      <p
                        className="clickable-text mt-3 mb-0"
                        onClick={handleClickRole}
                      >
                        Are you a teacher? Click here
                      </p>
                    )}
                    {user.role === "teacher" && (
                      <p
                        className="clickable-text mt-3 mb-0"
                        onClick={handleClickRole}
                      >
                        Are you a student? Click here
                      </p>
                    )}
                    {/* </div> */}
                  </form>
                </div>
              </div>
              {/* Column for the image */}
              <div
                className="col-md-5 d-flex justify-content-center align-items-center "
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

export default SignUpForm;
