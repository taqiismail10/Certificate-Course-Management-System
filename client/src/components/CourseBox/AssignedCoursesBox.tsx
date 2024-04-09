import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
interface Course {
  courseid: number;
  coursename: string;
  level: string;
  startDate: Date;
  endDate: Date;
  teachers: string[];
  assigned: boolean;
}

interface AssignedCoursesProps {
  teacherid: string;
}

const AssignedCourses: React.FC<AssignedCoursesProps> = ({ teacherid }) => {

  // Dummy data for assigned courses
  // 
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch assigned courses for the teacher with the provided teacherid
    axios.get(`http://localhost:5000/teacher-dashboard/${teacherid}`)
      .then(response => {
        setAssignedCourses(response.data.assignedCourses);
      })
      .catch(error => {
        console.error('Error fetching assigned courses:', error);
      });
  }, [teacherid]); // Re-run effect whenever teacherid changes

  return (
    <div className="col-md-12">
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3" style={{ fontSize: "30px", fontWeight: "normal" }}>
            Assigned Courses
          </h5>
          <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
            <ul className="list-group list-group-flush">
              {assignedCourses.map((course) => (
                <li key={course.courseid} className="list-group-item d-flex justify-content-between align-items-center">
                  <Link to={`/course-details/${course.courseid}`}>
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
