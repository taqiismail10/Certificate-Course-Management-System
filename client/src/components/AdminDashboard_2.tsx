import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../pages/style.css";
import Navbar_temp from "./Navbar_temp";

interface Course {
  id: number;
  name: string;
  level: string;
  startDate: Date;
  endDate: Date;
  teachers: string[];
  enrolled: boolean;
}

interface Teacher {
  name: string;
  email: string;
  designation: string;
}

const AdminDashboard: React.FC = () => {
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [unassignedCourses, setUnassignedCourses] = useState<Course[]>([]);
  const [popupOpen, setPopupOpen] = useState(false); // State to track whether the popup is open
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // State to track the course for which teachers are being assigned
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    // Fetch assigned courses from the database or API
    // Replace the axios.get call with the actual endpoint for fetching assigned courses
    axios.get<Course[]>('/api/assigned-courses')
      .then(response => {
        setAssignedCourses(response.data);
      })
      .catch(error => {
        console.error('Error fetching assigned courses:', error);
      });

    // Fetch unassigned courses from the database or API
    // Replace the axios.get call with the actual endpoint for fetching unassigned courses
    axios.get<Course[]>('/api/unassigned-courses')
      .then(response => {
        setUnassignedCourses(response.data);
      })
      .catch(error => {
        console.error('Error fetching unassigned courses:', error);
      });

    // Fetch teachers from the database or API
    // Replace the axios.get call with the actual endpoint for fetching teachers
    axios.get<Teacher[]>('/api/teachers')
      .then(response => {
        setTeachers(response.data);
      })
      .catch(error => {
        console.error('Error fetching teachers:', error);
      });
  }, []);

  const assignTeachers = (selectedTeachers: string[]) => {
    if (selectedCourse) {
      const updatedCourse = {
        ...selectedCourse,
        teachers: selectedTeachers,
        enrolled: true,
      };
      setAssignedCourses([...assignedCourses, updatedCourse]);
      setUnassignedCourses(
        unassignedCourses.filter((course) => course.id !== selectedCourse.id)
      );
      setPopupOpen(false);
    }
  };

  const togglePopup = (course: Course) => {
    setSelectedCourse(course);
    setPopupOpen(!popupOpen);
  };

  const renderPopup = () => {
    if (!popupOpen || !selectedCourse) return null;
    return (
      <div className="popup">
        <div
          className="popup-content"
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3>Select Teachers for {selectedCourse.name}</h3>
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Designation</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={index}>
                  <td>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={teacher.name}
                      id={`teacher-${index}`}
                    />
                  </td>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.designation}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "right" }}>
            <button className="btn btn-primary" onClick={handleAssign}>
              Assign
            </button>
            <button
              className="btn btn-secondary ms-2"
              onClick={() => setPopupOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleAssign = () => {
    const selectedTeachers: string[] = [];
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]:checked'
    );
    checkboxes.forEach((checkbox) => {
      selectedTeachers.push(checkbox.value);
    });
    assignTeachers(selectedTeachers);
  };

  const handleDelete = (courseId: number, isAssigned: boolean) => {
    if (isAssigned) {
      setAssignedCourses(
        assignedCourses.filter((course) => course.id !== courseId)
      );
    } else {
      setUnassignedCourses(
        unassignedCourses.filter((course) => course.id !== courseId)
      );
    }
  };

  // Render function to display course lists
  const renderCourseList = (
    title: string,
    courseList: Course[],
    isAssigned: boolean
  ) => (
    <div className="col-md-6">
      <div className="card mb-4">
        <div className="card-body">
          <h5
            className="card-title mb-3"
            style={{ fontSize: "30px", fontWeight: "normal" }}
          >
            {title}
          </h5>
          <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
            <ul className="list-group list-group-flush">
              {courseList.map((course) => (
                <div
                  key={course.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <Link to={`/course-details/${course.id}`}>
                    {course.name} ({course.level})
                  </Link>
                  <div>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => togglePopup(course)}
                      style={{ backgroundColor: "#005a5a" }}
                    >
                      Assign
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(course.id, isAssigned)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const handleCreateCourse = () => {
    // Navigate to the create course page
    // You can replace "/create-course" with the actual route for the create course page
    window.location.href = "/course-create";
  };

  return (
    <div
      className="container-fluid py-5"
      style={{
        backgroundImage: `url('bg_4.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar_temp />
      {renderPopup()}
      <div className="row justify-content-center align-items-center">
        <div className="col-md-10">
          <div
            className="card shadow w-100 mx-auto"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderRadius: "5px",
            }}
          >
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Courses</h2>
              {/* Button to navigate to the create course page */}
              <div className="text-center mb-4">
                <button
                  className="btn btn-primary"
                  onClick={handleCreateCourse}
                >
                  Create A Course
                </button>
              </div>
              <div className="row">
                {renderCourseList("Assigned Courses", assignedCourses, true)}
                {renderCourseList(
                  "Unassigned Courses",
                  unassignedCourses,
                  false
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
