import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { Course } from "../CourseDetails/CourseDetails";

interface Course {
    courseid: number;
    coursename: string;
    level: string;
    startDate: Date;
    endDate: Date;
    teachers: string[];
    enrolled: boolean;
}

const AssignedCourses: React.FC = () => {

    const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);

    useEffect(() => {

        const fetchCourses = async () => {
            try {
                const [assignedCourses] = await Promise.all([
                    axios.get<Course[]>("http://localhost:5000/assigned-courses"),
                ]);

                setAssignedCourses(assignedCourses.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };
        if (assignedCourses.length === 0) {
            fetchCourses();
        }
        return () => {
            // Cancel any pending requests (if using Axios cancel tokens)
        };
    }, [assignedCourses]); // Empty dependency array to run the effect only once
    console.log(assignedCourses);


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
                                    <Link to={`/course-page/${course.courseid}`}>
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
