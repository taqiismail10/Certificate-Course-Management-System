import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../pages/style.css";
import Navbar_temp from "./Navbar_temp";

interface Course {
  courseid: number;
  coursename: string;
  level: string;
  startDate: Date;
  endDate: Date;
  teachers: string[];
  enrolled: boolean;
}

const StudentDashboard: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [offeredCourses, setOfferedCourses] = useState<Course[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [enrolledResponse, offeredResponse, upcomingResponse] = await Promise.all([
          axios.get("http://localhost:5000/enrolled-courses"),
          axios.get("http://localhost:5000/offered-courses"),
          axios.get("http://localhost:5000/upcoming-courses")
        ]);

        setEnrolledCourses(enrolledResponse.data);
        setOfferedCourses(offeredResponse.data);
        setUpcomingCourses(upcomingResponse.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const renderCourseList = (title: string, courseList: Course[]) => (
    <div className="col-md-4">
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3" style={{ fontSize: '30px', fontWeight: 'normal' }}>{title}</h5>
          <ul className="list-group list-group-flush">
            {courseList.map((course) => (
              <Link to={`/course-details/${course.courseid}`} key={course.courseid} className="list-group-item">
                {course.coursename} ({course.level}{course.courseid})
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid vh-100 bg-white">
      <Navbar_temp />
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-md-10">
          <div className="card shadow w-100 mx-auto" style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", borderRadius: "5px" }}>
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Student Dashboard</h2>
              <div className="row">
                {renderCourseList("Enrolled Courses", enrolledCourses)}
                {renderCourseList("Offered Courses", offeredCourses)}
                {renderCourseList("Upcoming Courses", upcomingCourses)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
