import AssignedCoursesBox from "./AssignedCoursesBox";
import EnrolledCoursesBox from "./EnrolledCoursesBox";
import OfferedCoursesBox from "./OfferedCoursesBox";
import UpcomingCoursesBox from "./UpcomingCoursesBox";

interface CoursesBoxProps {
  userRole?: "teacher" | "student";
  teacherId?: string; // Add teacherId as a prop
  teacherName?: string;
  studentId?: string; // Add teacherId as a prop
}

const CoursesBox = ({ userRole, teacherId, teacherName = '', studentId }: CoursesBoxProps) => {
  let numCourseBoxes = 2; // Default number of course boxes for signed out users
  if (userRole === "teacher" || userRole === "student") {
    numCourseBoxes = 3; // Number of course boxes for teachers and students
  }
  const isEnrolled = "false"
  const isAssigned = "false"
  

  const colSize = Math.floor(12 / numCourseBoxes);
  return (
    <div className="container ">
      <div
        className="card mt-4 shadow w-100 mx-auto"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          borderRadius: "5px",
        }}
      >
        <h2 className="card-title mt-3 text-center">Courses</h2>
        {/* userRole = {userRole}
        <br />
        isAssigned = {isAssigned}
        <br />
        isEnrolled = {isEnrolled} */}
        <div className="card-body">
          <div className="row">
            <div className={`col-md-${colSize}`}>
              <OfferedCoursesBox userRole={userRole} studentid = {studentId} isEnrolled={isEnrolled} isAssigned={isAssigned} />
            </div>
            <div className={`col-md-${colSize}`}>
              <UpcomingCoursesBox userRole={userRole} studentid = {studentId} isEnrolled={isEnrolled} isAssigned={isAssigned} />
            </div>
            {(userRole === "teacher" || userRole === "student") && (
              <div className={`col-md-${colSize}`}>
                {userRole === "teacher" && teacherId ? (
                  <AssignedCoursesBox teacherid={teacherId} teacherName={teacherName} />
                ) : (
                  userRole === "student" && studentId && (
                    <EnrolledCoursesBox studentid={studentId} />)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesBox;
