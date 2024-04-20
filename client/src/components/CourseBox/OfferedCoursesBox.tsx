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
interface OfferedCoursesProps {
  userRole: string | null | undefined;
  studentid?: string | null | undefined;
  isAssigned: string | null | undefined;
  isEnrolled: string | null | undefined;
}
const OfferedCourses = ({ userRole ,isAssigned, isEnrolled, studentid}: OfferedCoursesProps) => {
  // Dummy data for offered courses
  // const courseList = [
  //   { id: 1, name: 'Offered Course 1', level: 'Beginner' },
  //   { id: 2, name: 'Offered Course 2', level: 'Intermediate' },
  //   { id: 3, name: 'Offered Course 3', level: 'Advanced' },
  //   { id: 4, name: 'Offered Course 4', level: 'Beginner' },
  // ];
  const [offeredCourses, setOfferedCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    try {
      const [offeredResponse] = await Promise.all([
        axios.get<Course[]>("http://localhost:5000/offered-courses"),
      ]);

      setOfferedCourses(offeredResponse.data);
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
            Offered Courses
          </h5>
          <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
            <ul className="list-group list-group-flush">
              {offeredCourses.map((course) => (
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

export default OfferedCourses;