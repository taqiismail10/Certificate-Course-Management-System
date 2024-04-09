// Import required modules

const express = require("express");

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

app.use('/authentication', require('./routes/authentication'));
app.use('/dashboard', require('./routes/dashboard'));

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

// Get course information including assigned teachers

// Assign a teacher to a course
// app.post('/courses/:courseId/assign-teacher', async (req, res) => {
//   const courseId = req.params.courseId;
//   const { teacherid } = req.body;
//   try {
//     const insertQuery = 'INSERT INTO teacherstakecourses (courseid, teacherid) VALUES ($1, $2)'; // Corrected table name
//     await pool.query(insertQuery, [courseId, teacherid]);
//     res.status(201).json({ success: 'Teacher assigned successfully' });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

// Assign teachers to a course
app.post("/courses/:courseId/assign-teachers", async (req, res) => {
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
app.delete("/courses/:courseId/remove-teacher/:teacherid", async (req, res) => {
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
app.get("/courses/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const courseQuery = "SELECT * FROM courses WHERE courseid = $1"; // Corrected column name
    const courseResult = await pool.query(courseQuery, [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    const teachersQuery = `
          SELECT t.teacherid, t.teacherfirstname, t.teacherlastname
          FROM teachers t
          JOIN teacherstakecourses ttc ON t.teacherid = ttc.teacherid
          WHERE ttc.courseid = $1
        `;
    const teachersResult = await pool.query(teachersQuery, [courseId]);
    const course = courseResult.rows[0];
    const teachers = teachersResult.rows;
    course.teachers = teachers;
    res.json(course);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete a course
app.delete("/courses/:courseId", async (req, res) => {
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
app.put("/courses/:courseId", async (req, res) => {
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

// admin-dashboard
app.use("/admin", adminDashboard);

// Start the server
app.listen(port, () => {
  console.log(`Server listening at  http://localhost:${port}`);
});
//admin dashboard : shb course er graphical view
// login korar somoy ami student naki teacher check korte chacchi nah, backend e eta check korbe na, so frontend e o option na thaka ta better ig
// Courses table thaka uchit, but sathe userId(fk) thaka uchit nah, cause admin teacher assign kora chara course create korte parbe nah || sorted
// ekta scenario, teacherder k assign korar por o ki unaderk abar  assign courses list e dekhano hobe naki hobe nah, naki sobaike protibar dekhano hobe, sathe unake koita course e assign kora hoise, etao dekhabe

// Now provide a backend code for admin, named admin-dashboard, where he can assign a courses to multiple teacher or single teacher, when he assign courses to teacher then data will insert into teahcerstakecourses table. He also can observe   Where he also can create courses(courseName, ects, start-date(which will be updated automatically), end-date, level).

//
//CCMS is a web application database system designed for individuals seeking access to top-tier university courses and expert instruction. It offers a centralized platform for course exploration and enrollment, featuring courses from prestigious universities and renowned faculty members. Users receive certificates upon course completion, enhancing their learning experiences. Ongoing development aims to broaden access to high-quality education, fostering inclusivity in learning.

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     let userId = null;

//     // Retrieve the user's ID based on the provided email and password
//     const userQuery = "SELECT userid, role FROM users WHERE email = $1 AND password = $2";
//     const userData = await pool.query(userQuery, [email, password]);

//     // If no user found with the provided email and password, return error
//     if (userData.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Get the user's ID and role from the database
//     userId = userData.rows[0].userid;
//     const userRole = userData.rows[0].role;

//     // Check if the user's role matches the provided role
//     if (userRole !== role) {
//       return res.status(401).json({ error: "Invalid role" });
//     }

//     // Redirect to the corresponding dashboard upon successful authentication
//     if (userId) {
//       if (role === "teacher") {
//         // Check the teacher table for the teacher's ID
//         const teacherQuery = "SELECT teacherid FROM teachers WHERE userid = $1";
//         const teacherData = await pool.query(teacherQuery, [userId]);
//         if (teacherData.rows.length === 0) {
//           return res.status(401).json({ error: "Teacher not found" });
//         }
//         return res.status(200).json({ userid: teacherData.rows[0].teacherid, role });
//       } else if (role === "student") {
//         // Check the student table for the student's ID
//         const studentQuery = "SELECT studentid FROM students WHERE userid = $1";
//         const studentData = await pool.query(studentQuery, [userId]);
//         if (studentData.rows.length === 0) {
//           return res.status(401).json({ error: "Student not found" });
//         }
//         return res.status(200).json({ userid: studentData.rows[0].studentid, role });
//       }
//     }

//     return res.status(401).json({ error: "User does not exist" });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

// student-dashboard
// app.get("/student-dashboard/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const query = "SELECT * FROM studentsenrollcourses WHERE studentId = $1";
//     const result = await pool.query(query, [studentId]);
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// });

//teacher-dashboard
// app.get("/teacher-dashboard/:teacherid", async (req, res) => {
//   try {
//     const { teacherid } = req.params;
//     const query = `
//       SELECT c.*
//       FROM courses c
//       INNER JOIN teachersTakeCourses ttc ON c.courseId = ttc.courseId
//       WHERE ttc.teacherid = $1`;
//     const result = await pool.query(query, [teacherid]);
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// });

// Login
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Retrieve the user with the provided email from the database
//     const userQuery =
//       "SELECT userid, password, role FROM users WHERE email = $1";
//     const userData = await pool.query(userQuery, [email]);

//     // If no user found with the provided email, return error
//     if (userData.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Check if the password matches
//     const hashedPassword = userData.rows[0].password;
//     const isPasswordValid = await verifyPassword(password, hashedPassword);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // If email and password are correct, generate JWT token
//     const userid = userData.rows[0].userid;
//     const role = userData.rows[0].role;
//     res.status(200).json({ userid, role });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Server Error ABC" });
//   }
// });

//DummySignup
// app.post("/signup", async (req, res) => {
//   try {
//     // Destructure relevant data from request body
//     const { firstName, lastName, email, password, role } = req.body;

//     // Check if the user already exists
//     const userExistsQuery = "SELECT * FROM users WHERE email = $1";
//     const existingUser = await pool.query(userExistsQuery, [email]);

//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert new user into the users table
//     const insertUserQuery =
//       "INSERT INTO users (firstName, lastName, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING userId";
//     const newUser = await pool.query(insertUserQuery, [
//       firstName,
//       lastName,
//       email,
//       hashedPassword,
//       role,
//     ]);

//     const userId = newUser.rows[0].userid; // Get the userId from the inserted user

//     if (role === "teacher") {
//       // Insert corresponding teacher record into the teachers table
//       const {
//         teacherfirstName,
//         teacherlastName,
//         teacherEmail,
//         designation,
//       } = req.body;
//       const insertTeacherQuery =
//         "INSERT INTO teachers (teacherfirstName, teacherlastName, teacherEmail, password, designation, userId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING userId";
//       await pool.query(insertTeacherQuery, [
//         teacherfirstName,
//         teacherlastName,
//         teacherEmail,
//         hashedPassword, // Use the original hashed password here
//         designation,
//         userId,
//       ]);
//       res
//         .status(201)
//         .json({ userId, success: "Teacher signed up successfully" });
//     } else {
//       // Insert corresponding student record into the students table
//       const { studentfirstName, studentlastName, studentEmail } = req.body;
//       const insertStudentQuery =
//         "INSERT INTO students (studentfirstName, studentlastName, studentEmail, userId) VALUES ($1, $2, $3, $4) RETURNING userId";
//       await pool.query(insertStudentQuery, [
//         studentfirstName,
//         studentlastName,
//         studentEmail,
//         userId,
//       ]);
//       console.log("Student signed up successfully");
//       res
//         .status(201)
//         .json({ userId, success: "Student signed up successfully" });
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

// student-dashboard
// app.get("/student-dashboard/:studentid", async (req, res) => {
//   try {
//     const { studentid } = req.params;

//     // Fetch student information from the students table
//     const studentQuery = "SELECT * FROM students WHERE studentid = $1";
//     const studentResult = await pool.query(studentQuery, [studentid]);
//     const studentInfo = studentResult.rows[0];

//     // Initialize variables to store enrolled courses and course information
//     let enrolledCourses = [];

//     // Check if the student has enrolled in courses
//     const enrollCoursesQuery =
//       "SELECT * FROM studentsenrollcourses WHERE studentid = $1";
//     const enrollCoursesResult = await pool.query(enrollCoursesQuery, [
//       studentid,
//     ]);
//     if (enrollCoursesResult.rows.length > 0) {
//       // If the student has enrolled courses, fetch enrolled courses
//       enrolledCourses = enrollCoursesResult.rows.map(
//         (course) => course.courseid
//       );

//       // Fetch information about enrolled courses
//       const enrolledCoursesQuery =
//         "SELECT * FROM courses WHERE courseid = ANY($1)";
//       const enrolledCoursesResult = await pool.query(enrolledCoursesQuery, [
//         enrolledCourses,
//       ]);
//       offeredCourses = enrolledCoursesResult.rows;
//     }

//     // Fetch all courses that are not enrolled by the student
//     const allCoursesQuery =
//       "SELECT * FROM courses WHERE courseid NOT IN (SELECT courseid FROM studentsenrollcourses WHERE studentid = $1)";
//     const allCoursesResult = await pool.query(allCoursesQuery, [studentid]);
//     upcomingCourses = allCoursesResult.rows;

//     // Send student dashboard data as JSON response
//     res.status(200).json({
//       studentid,
//       studentInfo,
//       enrolledCourses,
//     });
//     console.log(studentInfo);
//     console.log(studentid);
//     console.log(enrolledCourses);

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// });

// app.get("/student-dashboard/:studentid", async (req, res) => {
//   try {
//     const { studentid } = req.params;

//     // Fetch student information from the students table
//     const studentQuery = "SELECT * FROM students WHERE studentid = $1";
//     const studentResult = await pool.query(studentQuery, [studentid]);
//     const studentname = studentResult.rows[0].studentname;
//     const email = studentResult.rows[0].email;

//     // Initialize variable to store enrolled courses
//     let enrolledCourses = [];

//     // Check if the student has enrolled in courses
//     const enrollCoursesQuery =
//       "SELECT c.* FROM courses c INNER JOIN studentsenrollcourses sec ON c.courseid = sec.courseid WHERE sec.studentid = $1";
//     const enrollCoursesResult = await pool.query(enrollCoursesQuery, [
//       studentid,
//     ]);

//     if (enrollCoursesResult.rows.length > 0) {
//       // If the student has enrolled courses, fetch enrolled courses
//       enrolledCourses = enrollCoursesResult.rows;
//     }

//     // Log student information and enrolled courses
//     // console.log(studentInfo);
//     console.log(studentid);
//     console.log(studentname);
//     console.log(email);
//     console.log(enrolledCourses);

//     // Send student dashboard data as JSON response
//     res.status(200).json({
//       studentid,
//       studentInfo,
//       enrolledCourses,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// });

// Get enrolled-courses
// app.get("/enrolled-courses", async (req, res) => {
//   try {
//     const { userId, courseName, ects, level } = req.query; // Access userId from query parameters

//     if (!userId) {
//       return res.status(400).json({ error: "userId parameter is missing" });
//     }

//     // Query enrolled courses for the specific user from the database
//     const query = `
//     SELECT
//         c.courseName,
//         c.ects,
//         c.level
//     FROM
//         studentsEnrollCourses se
//     JOIN
//         courses c ON se.courseId = c.courseId
//     JOIN
//         users u ON se.userId = u.userId
//     WHERE
//         se.userId = $1
//         ${courseName ? "AND c.courseName = $2" : ""}
//         ${ects ? "AND c.ects = $3" : ""}
//         ${level ? "AND c.level = $4" : ""}`;

//     const params = [userId];
//     if (courseName) params.push(courseName);
//     if (ects) params.push(ects);
//     if (level) params.push(level);

//     console.log("Query:", query);
//     console.log("Params:", params);

//     const result = await pool.query(query, params);
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error:", err.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });
