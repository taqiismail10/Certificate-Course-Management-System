import OfferedCoursesBox from "./OfferedCoursesBox";
import UpcomingCoursesBox from "./UpcomingCoursesBox";
import EnrolledCoursesBox from "./EnrolledCoursesBox";
import AssignedCoursesBox from "./AssignedCoursesBox";

interface CoursesBoxProps {
  userRole?: "teacher" | "student";
  teacherId?: string; // Add teacherId as a prop

}

const CoursesBox = ({ userRole, teacherId }: CoursesBoxProps) => {
  let numCourseBoxes = 2; // Default number of course boxes for signed out users
  if (userRole === "teacher" || userRole === "student") {
    numCourseBoxes = 3; // Number of course boxes for teachers and students
  }

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
        <div className="card-body">
          <div className="row">
            <div className={`col-md-${colSize}`}>
              <OfferedCoursesBox />
            </div>
            <div className={`col-md-${colSize}`}>
              <UpcomingCoursesBox />
            </div>
            {(userRole === "teacher" || userRole === "student") && (
              <div className={`col-md-${colSize}`}>
                {userRole === "teacher" ? (
                  <AssignedCoursesBox teacherId={teacherId} />
                ) : (
                  <EnrolledCoursesBox />
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
