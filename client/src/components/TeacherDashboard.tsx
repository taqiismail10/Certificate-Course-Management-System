import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../pages/style.css";
import Navbar_temp from "./Navbar_temp";
import CourseList_nonAdmin from "./CourseList_nonAdmin";
interface Course {
  id: number;
  name: string;
  level: string;
  startDate: Date;
  endDate: Date;
  teachers: string[];
  enrolled: boolean;
}

const TeacherDashboard: React.FC = () => {
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [offeredCourses, setOfferedCourses] = useState<Course[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [assignedResponse, offeredResponse, upcomingResponse] = await Promise.all([
          axios.get("http://localhost:5000/assigned-courses"),
          axios.get("http://localhost:5000/offered-courses"),
          axios.get("http://localhost:5000/upcoming-courses")
        ]);

        setAssignedCourses(assignedResponse.data);
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
          <h5 className="card-title mb-3" style = {{fontSize:'30px', fontWeight:'normal'}}>{title}</h5>
          <ul className="list-group list-group-flush">
            {courseList.map((course) => (
              <Link to={`/course-details/${course.id}`} key={course.id} className="list-group-item">
                {course.name} ({course.level})
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid vh-100">
      <Navbar_temp/>
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-md-10">
          <div className="card shadow w-100 mx-auto" style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", borderRadius: "5px" }}>
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Teacher Dashboard</h2>
              <CourseList_nonAdmin/>
              <div className="row">
                {renderCourseList("Assigned Courses", assignedCourses)}
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

export default TeacherDashboard;
