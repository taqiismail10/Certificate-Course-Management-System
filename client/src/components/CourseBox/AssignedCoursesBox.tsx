import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Course } from "../CourseDetails/CourseDetails";

interface AssignedCoursesProps {
  teacherid: string; //might be number
  teacherName: string;
}

const AssignedCourses = ({ teacherid, teacherName }: AssignedCoursesProps) => {
  const userRole = "teacher";
  const isAssigned = "true";
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch assigned courses for the teacher with the provided teacherid
    axios
      .get(`http://localhost:5000/teacher-dashboard/${teacherid}`)
      .then((response) => {
        setAssignedCourses(response.data.assignedCourses);
      })
      .catch((error) => {
        console.error("Error fetching assigned courses:", error);
      });
  }, [teacherid]); // Re-run effect whenever teacherid changes

  return (
    <div className="col-md-12">
      <div className="card mb-4">
        <div className="card-body">
          <h5
            className="card-title mb-3"
            style={{ fontSize: "30px", fontWeight: "normal" }}
          >
            Assigned Courses
          </h5>
          <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
            <ul className="list-group list-group-flush">
              {assignedCourses.map((course) => (
                <li
                  key={course.courseid}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <Link
                    to={`/course-page/${course.courseid
                      }?userRole=${userRole}&teacherName=${encodeURIComponent(
                        teacherName
                      )}&teacherid=${encodeURIComponent(teacherid)}&isAssigned=${isAssigned}`}
                    style={{ textDecoration: "none", color: "#005a5a" }}
                  >
                    {course.coursename} ({course.level})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedCourses;