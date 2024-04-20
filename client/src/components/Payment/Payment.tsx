import axios from "axios";
import React, { useEffect, useState } from "react";
import { Course } from "../CourseDetails/CourseDetails";

interface PaymentProps {
  course: Course;
  teacherid: string | null | undefined;
  // teacherName: string | null | undefined;
}

const Payment: React.FC<PaymentProps> = ({
  course,
  teacherid,
  // teacherName,
}) => {
  const [sessionsTaken, setSessionsTaken] = useState<number>(0);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [firstName, setFirstName] = useState<string | null | undefined>("");
  const [lastName, setLastName] = useState<string | null | undefined>("");
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Fetch number of sessions taken by the teacher for the given course
        // const sessionsResponse = await axios.get(
        //   `http://localhost:5000/teachers/${teacherid}/courses/${course.courseid}/sessions`
        // );
        // setSessionsTaken(sessionsResponse.data.sessionsTaken);

        // Fetch due amount for the teacher for the given course
        const dueAmountResponse = await axios.get(
          `http://localhost:5000/teachers/${teacherid}/courses/${course.courseid}/payment`
        );
        setSessionsTaken(dueAmountResponse.data.session_count);
        setDueAmount(dueAmountResponse.data.total_payment);
        setFirstName(dueAmountResponse.data.teacher_name_result.teacherfirstname);
        setLastName(dueAmountResponse.data.teacher_name_result.teacherlastname);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    };

    fetchPaymentDetails();
  }, [course.courseid, teacherid]);

  // console.log(teacherid)
  // console.log(`course id: ${course.courseid}`)
  // console.log(`teacher id: ${teacherid}`)
  // console.log(sessionsTaken); 
  // console.log(dueAmount); 
  // console.log(firstName);
  // console.log(lastName);
  return (
    <div className="container mt-5">
      {/* sessionsTaken = {sessionsTaken}
      dueAmount = {dueAmount}
      firstName = {firstName}
      lastName = {lastName} */}
      <div className="card shadow p-4 rounded">
        <div>
          <strong>Course Name:</strong> {course.coursename}
        </div>
        <div>
          <strong>Course Level:</strong> {course.level}
        </div>
        <div>
          <strong>Sessions Taken:</strong> {sessionsTaken}
        </div>
        <div>
          <strong>Name of Instructor:</strong> {firstName} {lastName}
        </div>
        <hr />
        <div className="text-center">
          <strong>Due:</strong> {dueAmount}
        </div>
      </div>
    </div>
  );
};

export default Payment;
