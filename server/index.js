// Import required modules

const express = require("express");
const axios = require("axios"); // For Node.js environment

const dotenv = require("dotenv");
dotenv.config({ path: "/home/tim_10/TIM/project/Final_project/.env" });

const port = process.env.PORT;

const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const adminDashboard = require("./admin"); // Import admin routes
const bodyParser = require("body-parser");

// const jwt = require("jsonwebtoken");
// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Routes

// Get upcoming courses
app.get("/upcoming-courses", async (req, res) => {
  try {
    // Query upcoming courses from the database
    const query = `
      SELECT *
      FROM courses 
      WHERE startdate > CURRENT_DATE
      ORDER BY startdate ASC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Get offered courses
app.get("/offered-courses", async (req, res) => {
  try {
    // Query offered courses from the database
    const query = `
      SELECT *
      FROM courses 
      WHERE startdate <= CURRENT_DATE
      ORDER BY startdate DESC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
// Assign-courses
app.post("/admin/assign-courses", async (req, res) => {
  try {
    const { courseId, teacherid } = req.body;

    // Validate input
    if (!courseId || !teacherid || !Array.isArray(teacherid)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Check if the course exists
    const courseQuery = "SELECT * FROM courses WHERE courseId = $1";
    const courseResult = await pool.query(courseQuery, [courseId]);
    const course = courseResult.rows[0];
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Insert records into teachersTakeCourses table
    for (const teacherid of teacherid) {
      const insertQuery =
        "INSERT INTO teachersTakeCourses (teacherid, courseId) VALUES ($1, $2)";
      await pool.query(insertQuery, [teacherid, courseId]);
    }

    res.status(201).json({ success: "Courses assigned successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});
app.get("/teachers-list", async(req, res)=>{
    try{
      const query = "SELECT * FROM teachers";
      const result = await pool.query(query);
      res.status(201).json(result.rows);
      
    }
    catch(error){
      console.log(error.message);
      res.status(500).send("Server Error");
    }
});
app.get("/unassigned-courses", async (req, res) => {
  try {
    const query = `
      SELECT c.*
      FROM courses c
      LEFT JOIN teacherstakecourses ttc ON c.courseid = ttc.courseid
      WHERE ttc.courseid IS NULL
        AND c.startdate <= CURRENT_DATE
      ORDER BY c.startdate DESC`;
    const result = await pool.query(query);
    res.status(201).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

app.get("/assigned-courses", async (req, res) => {
  try {
    const query = `
      SELECT c.*
      FROM courses c
      INNER JOIN teacherstakecourses ttc ON c.courseid = ttc.courseid
      WHERE c.startdate <= CURRENT_DATE
      ORDER BY c.startdate ASC `;
    const result = await pool.query(query);
    res.status(201).json(result.rows);
    // console.log(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Create a new course
app.post("/course-create", async (req, res) => {
  try {
    const { courseName, ects, startDate, endDate, level } = req.body;

    // Validate input
    if (!courseName || !ects || !startDate || !endDate || !level) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert new course into courses table
    const insertQuery = `
      INSERT INTO courses (courseName, ects, startDate, endDate, level) 
      VALUES ($1, $2, $3, $4, $5) RETURNING courseId`;
    const result = await pool.query(insertQuery, [
      courseName,
      ects,
      startDate,
      endDate,
      level,
    ]);
    const courseId = result.rows[0].courseId;

    res.status(201).json({ courseId, success: "Course created successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({ error: "Server Error" });
  }
});

app.post("/enroll-course", async (req, res) => {
  try {
    const { courseid, studentid } = req.body;
    const insertQuery = `INSERT INTO studentsenrollcourses (courseid, studentid) VALUES ($1, $2) RETURNING courseid, studentid`;
    const result = await pool.query(insertQuery, [courseid, studentid]);

    // res.status(201).json({ success: "Course enrolled successfully" });
    if (result.rowCount === 1) {
      res.status(201).json({
        success: "Course enrolled successfully",
        enrollment: result.rows[0] // Include enrolled course and student IDs in the response
      });
    } else {
      // If rowCount is not 1, it means the insertion failed
      throw new Error("Failed to enroll in the course");
    }
    console.log(result);
  } catch (error) {
    res.status(400).json({ error: "Server Error" });
  }
});

// Assign teachers to a course
app.post("/unassigned-courses/assign-teachers", async (req, res) => {
  const courseId = req.params.courseId;
  const { teacherid } = req.body;
  try {
    // Check if teacherid is an array
    if (!Array.isArray(teacherid)) {
      return res
        .status(400)
        .json({ error: "Invalid data format. teacherid should be an array." });
    }

    // Validate if all teacherid exist in the teachers table
    const existingTeachers = await pool.query(
      "SELECT teacherid FROM teachers WHERE teacherid = ANY($1)",
      [teacherid]
    );
    if (existingTeachers.rows.length !== teacherid.length) {
      return res
        .status(400)
        .json({ error: "One or more selected teachers do not exist." });
    }

    // Insert each teacherid into teacherstakecourses table
    await Promise.all(
      teacherid.map(async (teacherid) => {
        const insertQuery =
          "INSERT INTO teacherstakecourses (courseid, teacherid) VALUES ($1, $2)";
        await pool.query(insertQuery, [courseId, teacherid]);
      })
    );

    res.status(201).json({ success: "Teachers assigned successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Remove a teacher from a course
app.delete("/assigned-courses/remove-teacher/:teacherid", async (req, res) => {
  const courseId = req.params.courseId;
  const teacherid = req.params.teacherid;
  try {
    const deleteQuery =
      "DELETE FROM teacherstakecourses WHERE courseid = $1 AND teacherid = $2"; // Corrected table name
    await pool.query(deleteQuery, [courseId, teacherid]);
    res.json({ success: "Teacher removed successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Course-Dashboard
app.get("/courses/:courseid", async (req, res) => {
  const courseId = req.params.courseid;
  try {
    const courseQuery = "SELECT * FROM courses WHERE courseid = $1"; // Corrected column name
    const courseResult = await pool.query(courseQuery, [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    const teachersQuery = `
          SELECT t.teacherid, t.teacherfirstname, t.teacherlastname, t.email
          FROM teachers t
          JOIN teacherstakecourses ttc ON t.teacherid = ttc.teacherid
          WHERE ttc.courseid = $1
        `;
    const teachersResult = await pool.query(teachersQuery, [courseId]);
    // const course = courseResult.rows[0];
    const teachers = teachersResult.rows;
    // course.teachers = teachers;

    const course = {
      ...courseResult.rows[0],
      teachers: teachers,
    };

    res.json(course);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete a course
app.delete("/courses/:courseid", async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if the course exists
    const course = await pool.query(
      "SELECT * FROM courses WHERE courseId = $1",
      [courseId]
    );
    if (course.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    // Remove teachers assigned to the course
    await pool.query("DELETE FROM teacherstakecourses WHERE courseId = $1", [
      courseId,
    ]);

    // Delete the course
    await pool.query("DELETE FROM courses WHERE courseId = $1", [courseId]);
    res.status(200).json({ success: "Course deleted successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Updating Course Info
app.put("/courses/:courseid", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseName, ects, startDate, endDate, level } = req.body;

    // Check if the course exists
    const course = await pool.query(
      "SELECT * FROM courses WHERE courseId = $1",
      [courseId]
    );
    if (course.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Update the course
    const updateCourseQuery = `
      UPDATE courses 
      SET 
        courseName = $1, 
        ects = $2, 
        startDate = $3, 
        endDate = $4, 
        level = $5 
      WHERE courseId = $6`;
    await pool.query(updateCourseQuery, [
      courseName,
      ects,
      startDate,
      endDate,
      level,
      courseId,
    ]);

    res.status(200).json({ success: "Course updated successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});
// courseid - 0e4c0173-b2ec-4a60-b565-eccabba525cd

// Sign up
app.post("/signup", async (req, res) => {
  try {
    // Destructure relevant data from request body
    const { firstName, lastName, email, password, designation, role } =
      req.body;

    // Check if the user already exists
    const userExistsQuery = "SELECT * FROM users WHERE email = $1";
    const existingUser = await pool.query(userExistsQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const token =

    // Insert new user into the users table
    const insertUserQuery =
      "INSERT INTO users (firstName, lastName, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING userId";
    const newUser = await pool.query(insertUserQuery, [
      firstName,
      lastName,
      email,
      hashedPassword,
      role,
    ]);
    console.log(newUser);
    let userId = newUser.rows[0].userid; // Get the userId from the inserted user

    if (role === "teacher") {
      const insertTeacherQuery =
        "INSERT INTO teachers (teacherfirstName, teacherlastName, email, password, designation, userId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING teacherid";
      const newTeacher = await pool.query(insertTeacherQuery, [
        firstName,
        lastName,
        email,
        hashedPassword,
        designation,
        userId,
      ]);
      const teacherid = newTeacher.rows[0].teacherid;
      console.log(teacherid);
      res
        .status(201)
        .json({ teacherid, success: "Teacher signed up successfully" });
    } else {
      const insertStudentQuery =
        "INSERT INTO students (studentfirstName, studentlastName, email, password, userId) VALUES ($1, $2, $3, $4, $5) RETURNING studentid";
      const newStudent = await pool.query(insertStudentQuery, [
        firstName,
        lastName,
        email,
        hashedPassword,
        userId,
      ]);
      const studentid = newStudent.rows[0].studentid;

      console.log(studentid);
      res
        .status(201)
        .json({ studentid, success: "Student signed up successfully" });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/admin-login", async (req, res) => {
  try {
    const { password } = req.body;

    // Check if the user is an admin
    const adminQuery =
      "SELECT adminId FROM admin WHERE adminemail = $1 AND password = $2";
    const adminData = await pool.query(adminQuery, [
      "admin@admin.com",
      password,
    ]);

    if (adminData.rows.length > 0) {
      // If the user is found in the admin table with matching email and password, return admin information
      const adminId = adminData.rows[0].adminId;
      return res.status(200).json({ adminId, role: "admin" });
    }

    // If no admin found or invalid email/password combination, return error
    return res.status(401).json({ error: "Invalid email or password" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // console.log(email);
    // console.log(password);
    // console.log(role);
    if (role === "teacher") {
      // Retrieve the user with the provided email from the database
      const userQuery =
        "SELECT teacherid, password FROM teachers WHERE email = $1";
      const userData = await pool.query(userQuery, [email]);
      console.log();
      // If no user found with the provided email, return error
      if (userData.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if the password matches
      const hashedPassword = userData.rows[0].password;
      const isPasswordValid = await verifyPassword(password, hashedPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // If email and password are correct, generate JWT token
      const teacherid = userData.rows[0].teacherid;

      console.log("Teacher login successful. Teacher ID:", teacherid);

      res.status(200).json({ teacherid }); // Use 'teacherid' key instead of 'teacherid'
    } else if (role === "student") {
      // Retrieve the user with the provided email from the database
      const userQuery =
        "SELECT studentid, password FROM students WHERE email = $1";
      const userData = await pool.query(userQuery, [email]);

      // If no user found with the provided email, return error
      if (userData.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if the password matches
      const hashedPassword = userData.rows[0].password;
      const isPasswordValid = await verifyPassword(password, hashedPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // If email and password are correct, generate JWT token
      const studentid = userData.rows[0].studentid;
      console.log("Student login successful. Student ID:", studentid);
      res.status(200).json({ studentid }); // Use 'studentid' key instead of 'studentId'
    } else {
      return res.status(401).json({ error: "Invalid role" });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Function to compare passwords securely using bcrypt
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    // Compare the provided plain password with the hashed password
    const isPasswordValid = await bcrypt.compare(plainPassword, hashedPassword);
    return isPasswordValid;
  } catch (error) {
    console.error("Error verifying password:", error.message);
    throw new Error("Password verification failed");
  }
}

app.get("/student-dashboard/:studentid", async (req, res) => {
  try {
    const { studentid } = req.params;

    // Fetch student information from the students table
    const studentQuery = "SELECT * FROM students WHERE studentid = $1";
    const studentResult = await pool.query(studentQuery, [studentid]);
    const { studentfirstname, studentlastname, email } = studentResult.rows[0];

    // Fetch enrolled courses for the student
    const enrollCoursesQuery =
      "SELECT c.* FROM courses c INNER JOIN studentsenrollcourses sec ON c.courseid = sec.courseid WHERE sec.studentid = $1";
    const enrollCoursesResult = await pool.query(enrollCoursesQuery, [
      studentid,
    ]);
    const enrolledCourses = enrollCoursesResult.rows;

    // Log student information and enrolled courses
    // console.log("Student ID:", studentid);
    // console.log("Student Name:", studentname);
    // console.log("Email:", email);
    // console.log("Enrolled Courses:", enrolledCourses);

    // Send student dashboard data as JSON response
    res.status(200).json({
      studentid,
      studentfirstname,
      studentlastname,
      email,
      enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error.message);
    res.status(500).send("Server Error");
  }
});

// teacher-dashboard
app.get("/teacher-dashboard/:teacherid", async (req, res) => {
  try {
    const { teacherid } = req.params;

    // Fetch teacher information from the teachers table
    const teacherQuery = "SELECT * FROM teachers WHERE teacherid = $1";
    const teacherResult = await pool.query(teacherQuery, [teacherid]);
    const { teacherfirstname, teacherlastname, email, designation } =
      teacherResult.rows[0];

    // Fetch assigned courses for the teacher from the teachersTakeCourses table
    const assignedCoursesQuery = `
      SELECT c.*
      FROM courses c
      INNER JOIN teachersTakeCourses ttc ON c.courseId = ttc.courseId
      WHERE ttc.teacherid = $1`;
    const assignedCoursesResult = await pool.query(assignedCoursesQuery, [
      teacherid,
    ]);
    const assignedCourses = assignedCoursesResult.rows;

    // Send teacher dashboard data as JSON response
    res.status(200).json({
      teacherid,
      teacherfirstname,
      teacherlastname,
      email,
      designation,
      assignedCourses,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Define a route to get the number of sessions taken by a specific teacher in a particular course
app.get("/teachers/:teacherid/courses/:courseid/sessions", async (req, res) => {
  const { teacherId, courseId } = req.params;
  try {
    // Query to retrieve the number of sessions taken by the specified teacher in the course
    const sessionCountQuery = `
      SELECT COUNT(sessionid) AS session_count
      FROM sessions
      WHERE courseid = $1 AND teacherid = $2
    `;

    // Execute the query
    const sessionCountResult = await pool.query(sessionCountQuery, [
      courseId,
      teacherId,
    ]);

    // Send the result as JSON response
    res.status(201).json({
      teacherId,
      courseId,
      session_count: sessionCountResult.rows[0].session_count,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/teachers/:teacherid/courses/:courseid/payment", async (req, res) => {
  const { teacherid, courseid } = req.params;
  
console.log(`course id: ${courseid}`) //works perfectly
console.log(`teacher id: ${teacherid}`) //works perfectly
  try {
    // Query to retrieve the number of sessions taken by the specified teacher in the course
    const sessionCountQuery = `
      SELECT COUNT(sessionid) AS session_count
      FROM sessions
      WHERE courseid = $1 AND teacherid = $2
    `;
    const teacherNameQuery = `
      SELECT teacherfirstname, teacherlastname from teachers WHERE teacherid = $1`;
      const teacherNameResult = await pool.query(teacherNameQuery, [teacherid]);
    // Execute the query to get session count
    const sessionCountResponse = await pool.query(sessionCountQuery, [
      courseid,
      teacherid,
    ]);
    const sessionCount = sessionCountResponse.rows[0].session_count;

    // Log the session count
    console.log("Session Count:", sessionCount);//works perfectly

    // Query to retrieve course level and ECTS
    const courseQuery = "SELECT level, ects FROM courses WHERE courseid = $1";
    const courseResult = await pool.query(courseQuery, [courseid]);
    const courseLevel = courseResult.rows[0].level;
    const courseEcts = courseResult.rows[0].ects;

    // Log the course level and ECTS
    console.log("Course Level:", courseLevel);//works perfectly
    console.log("Course ECTS:", courseEcts);//works perfectly

    // Calculate payment based on course level and ECTS
    let paymentPerEcts = 0;
    switch (courseLevel) {
      case "beginner":
        paymentPerEcts = 500;
        break;
      case "intermediate":
        paymentPerEcts = 800;
        break;
      case "advanced":
        paymentPerEcts = 1200;
        break;
      // No default case needed as course level must be one of the specified options
    }

    // Log the payment per session
    console.log("Payment Per Session:", paymentPerEcts);//works perfectly
    console.log(teacherNameResult.rows[0])

    // Calculate total payment
    const totalPayment = sessionCount * paymentPerEcts * courseEcts;

    // Log the total payment
    console.log("Total Payment:", totalPayment);//works perfectly

    // Send the result as JSON response
    res.status(201).json({
      session_count: sessionCount,
      payment_per_ects: paymentPerEcts,
      total_payment: totalPayment,
      teacher_name_result: {
        teacherfirstname: teacherNameResult.rows[0].teacherfirstname,
        teacherlastname: teacherNameResult.rows[0].teacherlastname
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// admin-dashboard
app.use("/admin", adminDashboard);

// Start the server
app.listen(port, () => {
  console.log(`Server listening at  http://localhost:${port}`);
});

