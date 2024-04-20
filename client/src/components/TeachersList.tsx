import React, { useState, useEffect } from "react";
import axios from "axios";

interface TeacherProps {
    courseid: string | null | undefined;
    teacherid: string;
    teacherfirstname: string;
    teacherlastname: string;
    email: string;
    designation: string;
}

const TeacherList:React.FC<TeacherProps> = ({ courseid, }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  useEffect(() => {
    // Fetch list of teachers from the server
    axios
      .get("/teachers-list")
      .then((response) => {
        setTeachers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  }, []);

  const handleCheckboxChange = (teacherId) => {
    // Toggle selection of teacher
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(selectedTeachers.filter((id) => id !== teacherId));
    } else {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    }
  };

  const handleAssignTeachers = () => {
    // Post selected teacher IDs and course ID to the server
    selectedTeachers.forEach((teacherId) => {
      axios
        .post("/assign-teacher", { courseId, teacherId })
        .then((response) => {
          console.log("Teacher assigned successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error assigning teacher:", error);
        });
    });
  };

  return (
    <div>
      <h2>Teacher List</h2>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher.teacherid}>
            <label>
              <input
                type="checkbox"
                value={teacher.teacherid}
                checked={selectedTeachers.includes(teacher.teacherid)}
                onChange={() => handleCheckboxChange(teacher.teacherid)}
              />
              {teacher.teacherfirstname} {teacher.teacherlastname}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleAssignTeachers}>Assign Selected Teachers</button>
    </div>
  );
};

export default TeacherList;
