// Import required modules
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");

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

app.post("/signup", async (req, res) => {
  try {
    // Destructure relevant data from request body
    const { firstName, lastName, email, password, role } = req.body;

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
    const userId = newUser.rows[0].userid; // Get the userId from the inserted user

    if (role === "teacher") {
      const userId = newUser.rows[0].userid;

      // Insert corresponding teacher record into the teachers table
      const { designation } = req.body;
      const insertTeacherQuery =
        "INSERT INTO teachers (designation, userId) VALUES ($1, $2)";
      await pool.query(insertTeacherQuery, [designation, userId]);
      res
        .status(201)
        .json({ userId, success: "Teacher signed up successfully" });
    } else {
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
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     // Retrieve the user with the provided email from the database
//     const userQuery =
//       // "SELECT * FROM users WHERE email = $1 AND role = 'teacher'";
//       "SELECT * FROM users WHERE email = $1 RETURNING userId";

//     const userData = await pool.query(userQuery, [email]);

//     // If no user found with the provided email or the role is not teacher, return error
//     if (userData.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or role" });
//     }

//     // Check if the password matches
//     const hashedPassword = userData.rows[0].password;
//     const isPasswordValid = await verifyPassword(password, hashedPassword);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     // If email and password are correct, generate JWT token
//     const userId = userData.rows[0].userId;
//     const token = generateToken(userId, "teacher");

//     // Send the token as response
//     res.status(200).json({ token });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve the user with the provided email from the database
    const userQuery =
      "SELECT userId, password, role FROM users WHERE email = $1";
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
    const userId = userData.rows[0].userid;
    const role = userData.rows[0].role; // assuming role is retrieved from database
    res.status(200).json({ userId });

    // // Determine the profile URL based on the role
    // let profileUrl;
    // switch (role) {
    //   case "teacher":
    //     profileUrl = "/teacher/profile";
    //     break;
    //   case "student":
    //     profileUrl = "/student/profile";
    //     break;
    //   // Add more cases for other roles if needed
    //   default:
    //     profileUrl = "/profile";
    //     break;
    // }

    // Send the token and profile URL as response
    // res.status(200).json({ token, profileUrl });
    // res.status(200).json({ profileUrl });
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

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
//admin dashboard : shb course er graphical view
