import React, { useState } from "react";
import Navbar_temp from "./Navbar_temp";
import axios from "axios";

const CreateCourseForm: React.FC = () => {
  const [course, setCourse] = useState({
    courseName: "",
    ects: "",
    startDate: "",
    endDate: "",
    level: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
  };

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  //   const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setStartDate(e.target.value);
  //     setErrorMessage("");
  //   };

  //   const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setEndDate(e.target.value);
  //     setErrorMessage("");
  //   };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj > endDateObj) {
      alert("Start date cannot be after end date.");
      return;
    }
    console.log(course);
    try {
      const response = await axios.post(
        "http://localhost:5000/course-create",
        course
      );

      console.log(response.data);

      // Reset form fields after successful submission
      setCourse({
        courseName: "",
        ects: "",
        startDate: "",
        endDate: "",
        level: "",
      });
    }
    catch (error) {
      console.error(error);
      alert("Error creating course. Please try again.");

    }


  };

  return (
    <div
      className="container-fluid py-3"
      style={{
        backgroundImage: `url('bg_1.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar_temp />
      <div className="row justify-content-center align-items-center">
        <div className="col-md-6">
          <div className="card shadow w-100 mx-auto"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderRadius: "5px",
            }}>
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Create Course</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="courseName" className="form-label">
                    Course Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="courseName"
                    name="courseName"
                    value={course.courseName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="ects" className="form-label">
                    ECTS
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="ects"
                    name="ects"
                    value={course.ects}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="startDate" className="form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    value={course.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="endDate" className="form-label">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    name="endDate"
                    value={course.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="level" className="form-label">
                    Level
                  </label>
                  <select
                    className="form-select"
                    id="level"
                    name="level"
                    value={course.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseForm;
