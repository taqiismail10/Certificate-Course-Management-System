import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Course {
  courseid: number;
  coursename: string;
  level: string;
  startDate: Date;
  endDate: Date;
  teachers: string[];
  enrolled: boolean;
}

interface UpcomingCoursesProps {
  userRole: string | null | undefined;
  studentid?: string | null | undefined;
  isAssigned: string | null | undefined;
  isEnrolled: string | null | undefined;
}
const UpcomingCourses = ({ userRole , studentid, isAssigned, isEnrolled}: UpcomingCoursesProps) => {
  // Dummy data for upcoming courses
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);
  const fetchCourses = async () => {
    try {
      const [upcomingResponse] = await Promise.all([
        axios.get<Course[]>("http://localhost:5000/upcoming-courses"),
      ]);

      setUpcomingCourses(upcomingResponse.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  fetchCourses();

  return (
    <div className="col-md-12">
      <div className="card mb-4">
        <div className="card-body">
          <h5
            className="card-title mb-3"
            style={{ fontSize: "30px", fontWeight: "normal" }}
          >
            Upcoming Courses
          </h5>
          <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
            <ul className="list-group list-group-flush">
              {upcomingCourses.map((course) => (
                <li
                  key={course.courseid}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <Link
                    to={`/course-page/${course.courseid}?userRole=${userRole}&isEnrolled=${isEnrolled}&isAssigned=${isAssigned}&studentid=${studentid}`}
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

export default UpcomingCourses;