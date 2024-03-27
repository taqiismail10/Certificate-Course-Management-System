import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Course {
  courseid: number;
  coursename: string;
  level: string;
  startDate: Date;
  endDate: Date;
  teachers: string[];
  enrolled: boolean;
}

const CourseList_nonAdmin: React.FC = () => {
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [offeredCourses, setOfferedCourses] = useState<Course[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Check if student is logged in (you can implement your own logic here)
    const studentLoggedIn = true; // Placeholder logic, replace with your actual login check
    setIsStudent(studentLoggedIn);

    // Check if teacher is logged in (you can implement your own logic here)
    const teacherLoggedIn = true; // Placeholder logic, replace with your actual login check
    setIsTeacher(teacherLoggedIn);

    // Fetch offered and upcoming courses regardless of login status
    const fetchCourses = async () => {
      try {
        const [offeredResponse, upcomingResponse] = await Promise.all([
          axios.get<Course[]>("http://localhost:5000/offered-courses"),
          axios.get<Course[]>("http://localhost:5000/upcoming-courses"),
        ]);

        setOfferedCourses(offeredResponse.data);
        setUpcomingCourses(upcomingResponse.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();

    // Fetch enrolled courses only if student is logged in and current path includes 'student-dashboard'
    if (location.pathname.includes("student-dashboard")) {
      const fetchEnrolledCourses = async () => {
        try {
          const enrolledResponse = await axios.get<Course[]>(
            "http://localhost:5000/enrolled-courses"
          );
          setEnrolledCourses(enrolledResponse.data);
        } catch (error) {
          console.error("Error fetching enrolled courses:", error);
        }
      };

      fetchEnrolledCourses();
    }

    // Fetch assigned courses only if teacher is logged in and current path includes 'teacher-dashboard'
    if (location.pathname.includes("teacher-dashboard")) {
      const fetchAssignedCourses = async () => {
        try {
          const assignedResponse = await axios.get<Course[]>(
            "http://localhost:5000/assigned-courses"
          );
          setAssignedCourses(assignedResponse.data);
        } catch (error) {
          console.error("Error fetching assigned courses:", error);
        }
      };

      fetchAssignedCourses();
    }
  }, []);

  const renderCourseList = (title: string, courseList: Course[]) => (
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
                <Link
                  to={`/course-details/${course.courseid}`}
                  key={course.courseid}
                  className="list-group-item"
                >
                  {course.coursename} ({course.level})
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-5">
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
              <div className="row">
                {/* {isStudent &&
                  renderCourseList("Enrolled Courses", enrolledCourses)} */}
                {renderCourseList("Offered Courses", offeredCourses)}
                {renderCourseList("Upcoming Courses", upcomingCourses)}
                {/* {isTeacher &&
                  renderCourseList("Assigned Courses", assignedCourses)} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList_nonAdmin;
