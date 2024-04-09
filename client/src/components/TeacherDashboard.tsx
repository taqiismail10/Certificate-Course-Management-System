import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "../pages/style.css";
import Navbar_temp from "./Navbar_temp";
// import CourseList_nonAdmin from "./CourseList_nonAdmin";
import CourseBox from "./CourseBox/CourseBox";
import AssignedCourses from "./CourseBox/AssignedCoursesBox.tsx";

interface Course {
  courseid: string;
  coursename: string;
  level: string;
}
// interface AssignedCoursesProps {
//   assignedCourses: Course[]; // Add assignedCourses prop
// }

const TeacherDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);



  // const TeacherDashboard: React.FC = () => {
  //   const { id } = useParams<{ id: string }>();
  //   const [teacherid, setTeacherId] = useState<string>("");

  //   useEffect(() => {
  //     // Check if 'id' is not undefined before setting the teacher ID
  //     if (id) {
  //       setTeacherId(id);
  //     }
  //   }, [id]); // Re-run effect whenever the 'id' parameter changes
  useEffect(() => {
    const fetchAssignedCourses = async () => {
      try {
        const response = await axios.get(`/teacher-dashboard/${id}`);
        setAssignedCourses(response.data.assignedCourses);
      } catch (error) {
        console.error("Error fetching assigned courses:", error);
      }
    };

    fetchAssignedCourses();
  }, [id]);

  console.log(id);

  return (
    <div className="container-fluid vh-100">
      <Navbar_temp />
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-md-10">
          <div className="card shadow w-100 mx-auto" style={{ backgroundColor: "rgba(255, 255, 255, 0.5)", borderRadius: "5px" }}>
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Teacher Dashboard</h2>
              <CourseBox userRole="teacher" teacherId={id}></CourseBox>
              {/* <AssignedCourses assignedCourses={assignedCourses} /> */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;







// interface Course {
//   id: number;
//   name: string;
//   level: string;
//   startDate: Date;
//   endDate: Date;
//   teachers: string[];
//   enrolled: boolean;
// }

// const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
// const [offeredCourses, setOfferedCourses] = useState<Course[]>([]);
// const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);

// useEffect(() => {
//   const fetchCourses = async () => {
//     try {
//       const [assignedResponse, offeredResponse, upcomingResponse] = await Promise.all([
//         axios.get("http://localhost:5000/assigned-courses"),
//         axios.get("http://localhost:5000/offered-courses"),
//         axios.get("http://localhost:5000/upcoming-courses")
//       ]);

//       setAssignedCourses(assignedResponse.data);
//       setOfferedCourses(offeredResponse.data);
//       setUpcomingCourses(upcomingResponse.data);
//     } catch (error) {
//       console.error("Error fetching courses:", error);
//     }
//   };

//   fetchCourses();
// }, []);

// const renderCourseList = (title: string, courseList: Course[]) => (
//   <div className="col-md-4">
//     <div className="card mb-4">
//       <div className="card-body">
//         <h5 className="card-title mb-3" style = {{fontSize:'30px', fontWeight:'normal'}}>{title}</h5>
//         <ul className="list-group list-group-flush">
//           {courseList.map((course) => (
//             <Link to={`/course-details/${course.id}`} key={course.id} className="list-group-item">
//               {course.name} ({course.level})
//             </Link>
//           ))}
//         </ul>
//       </div>
//     </div>
//   </div>
// );
{/* <div className="row">
                {renderCourseList("Assigned Courses", assignedCourses)}
                {renderCourseList("Offered Courses", offeredCourses)}
                {renderCourseList("Upcoming Courses", upcomingCourses)}
              </div> */}