// Import required modules
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const adminDashboard = require("./admin"); // Import admin routes

// Create Express app
const app = express();

// Middleware
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
// Get enrolled-courses
app.get("/enrolled-courses", async (req, res) => {
  try {
    const { userId, courseName, ects, level } = req.query; // Access userId from query parameters

    if (!userId) {
      return res.status(400).json({ error: "userId parameter is missing" });
    }

    // Query enrolled courses for the specific user from the database
    const query = `
    SELECT 
        c.courseName,
        c.ects,
        c.level
    FROM 
        studentsEnrollCourses se
    JOIN 
        courses c ON se.courseId = c.courseId
    JOIN 
        users u ON se.userId = u.userId
    WHERE 
        se.userId = $1
        ${courseName ? "AND c.courseName = $2" : ""}
        ${ects ? "AND c.ects = $3" : ""}
        ${level ? "AND c.level = $4" : ""}`;

    const params = [userId];
    if (courseName) params.push(courseName);
    if (ects) params.push(ects);
    if (level) params.push(level);

    console.log("Query:", query);
    console.log("Params:", params);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});
// Assign-courses
app.post("/admin/assign-courses", async (req, res) => {
  try {
    const { courseId, teacherIds } = req.body;

    // Validate input
    if (!courseId || !teacherIds || !Array.isArray(teacherIds)) {
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
    for (const teacherId of teacherIds) {
      const insertQuery =
        "INSERT INTO teachersTakeCourses (teacherId, courseId) VALUES ($1, $2)";
      await pool.query(insertQuery, [teacherId, courseId]);
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
      userId = newUser.rows[0].userid;

      const insertTeacherQuery =
        "INSERT INTO teachers (teacherfirstName, teacherlastName, teacherEmail, password, designation, userId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING userId";
      await pool.query(insertTeacherQuery, [
        firstName,
        lastName,
        email,
        hashedPassword,
        designation,
        userId,
      ]);
      res
        .status(201)
        .json({ userId, success: "Teacher signed up successfully" });
    } else {
      userId = newUser.rows[0].userid;
      const insertTeacherQuery =
        "INSERT INTO students (studentfirstName, studentlastName, studentEmail, password, userId) VALUES ($1, $2, $3, $4, $5) RETURNING userId";
      await pool.query(insertTeacherQuery, [
        firstName,
        lastName,
        email,
        hashedPassword,
        userId,
      ]);
      console.log("Student signed up successfully");
      res
        .status(201)
        .json({ userId, success: "Student signed up successfully" });
    }
    console.log(userId);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

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

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve the user with the provided email from the database
    const userQuery =
      "SELECT userid, password, role FROM users WHERE email = $1";
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
    const userid = userData.rows[0].userid;
    const role = userData.rows[0].role;
    res.status(200).json({ userid, role });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error ABC" });
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
// student-dashboard
app.get("/student-dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = "SELECT * FROM studentsenrollcourses WHERE userId = $1";
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// teacher-dashboard
app.get("/teacher-dashboard/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const query = `
      SELECT c.*
      FROM courses c
      INNER JOIN teachersTakeCourses ttc ON c.courseId = ttc.courseId
      WHERE ttc.teacherId = $1`;
    const result = await pool.query(query, [teacherId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// admin-dashboard
app.use("/admin", adminDashboard);

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
//admin dashboard : shb course er graphical view
// login korar somoy ami student naki teacher check korte chacchi nah, backend e eta check korbe na, so frontend e o option na thaka ta better ig
// Courses table thaka uchit, but sathe userId(fk) thaka uchit nah, cause admin teacher assign kora chara course create korte parbe nah || sorted
// ekta scenario, teacherder k assign korar por o ki unaderk abar  assign courses list e dekhano hobe naki hobe nah, naki sobaike protibar dekhano hobe, sathe unake koita course e assign kora hoise, etao dekhabe

// Now provide a backend code for admin, named admin-dashboard, where he can assign a courses to multiple teacher or single teacher, when he assign courses to teacher then data will insert into teahcerstakecourses table. He also can observe   Where he also can create courses(courseName, ects, start-date(which will be updated automatically), end-date, level).

//
//CCMS is a web application database system designed for individuals seeking access to top-tier university courses and expert instruction. It offers a centralized platform for course exploration and enrollment, featuring courses from prestigious universities and renowned faculty members. Users receive certificates upon course completion, enhancing their learning experiences. Ongoing development aims to broaden access to high-quality education, fostering inclusivity in learning.