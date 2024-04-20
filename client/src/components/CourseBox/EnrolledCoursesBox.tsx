import axios from "axios";
import { useEffect, useState } from "react";
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

interface EnrolledCoursesProps {
  studentid: string;
}

const EnrolledCourses = ({ studentid }: EnrolledCoursesProps) => {
  // Dummy data for assigned courses

  //
  const isEnrolled = "true";
  const userRole = "student";
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch assigned courses for the teacher with the provided teacherId
    axios
      .get(`http://localhost:5000/student-dashboard/${studentid}`)
      .then((response) => {
        setEnrolledCourses(response.data.enrolledCourses);
      })
      .catch((error) => {
        console.error("Error fetching assigned courses:", error);
      });


    return () => {
      // Cancel any pending requests (if using Axios cancel tokens)
    };
  }, [studentid]); // Re-run effect whenever teacherId changes

  // done by abbas
  // const EnrolledCourses: React.FC = () => {
  // Dummy data for enrolled courses
  // const courseList = [
  //   { id: 1, name: 'Enrolled Course 1', level: 'Beginner' },
  //   { id: 2, name: 'Enrolled Course 2', level: 'Intermediate' },
  //   { id: 3, name: 'Enrolled Course 3', level: 'Advanced' },
  //   { id: 4, name: 'Enrolled Course 4', level: 'Beginner' },
  // ];

  //   const [enrolledCourses, setOfferedCourses] = useState<Course[]>([]);

  //   const fetchCourses = async () => {
  //     try {
  //       const [offeredResponse] = await Promise.all([
  //         axios.get<Course[]>("http://localhost:5000/enrolled-courses"),
  //       ]);

  //       setOfferedCourses(offeredResponse.data);
  //     } catch (error) {
  //       console.error("Error fetching courses:", error);
  //     }
  //   };
  // fetchCourses();

  return (
    <div className="col-md-12">
      <div className="card mb-4">
        <div className="card-body">
          <h5
            className="card-title mb-3"
            style={{ fontSize: "30px", fontWeight: "normal" }}
          >
            Enrolled Courses
          </h5>
          <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
            {/* studentId: {studentid} */}
            <ul className="list-group list-group-flush">
              {enrolledCourses.map((course) => (
                <li
                  key={course.courseid}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <Link to={`/course-page/${course.courseid}?studentid=${studentid}&isEnrolled=${isEnrolled}&userRole=${userRole}`} style={{ textDecoration: "none", color: "#005a5a" }}>
                    {course.coursename} ({course.level})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div >
  );
};

export default EnrolledCourses;
