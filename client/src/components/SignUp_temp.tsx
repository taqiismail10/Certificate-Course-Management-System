import React, { useState } from "react";
import axios from "axios";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  designation?: string;
}

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Student",
    designation: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRoleChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      role: prevData.role === "Student" ? "Teacher" : "Student",
      designation: prevData.role === "Student" ? "" : prevData.designation,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await axios.post("http://localhost:3000/api/signup", formData);
      console.log("Signup successful:", response.data);
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <form className="container mt-5" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="firstName" className="form-label">
          First Name:
        </label>
        <input
          type="text"
          className="form-control"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="lastName" className="form-label">
          Last Name:
        </label>
        <input
          type="text"
          className="form-control"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email:
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password:
        </label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>

      {formData.role === "Teacher" && (
        <div className="mb-3">
          <label htmlFor="designation" className="form-label">
            Designation:
          </label>
          <select
            className="form-select"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Designation</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Professor">Professor</option>
          </select>
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        Sign Up
      </button>
      <button
        type="button"
        className="btn btn-secondary ms-2"
        onClick={handleRoleChange}
      >
        Switch Role
      </button>
    </form>
  );
};

export default SignupForm;
