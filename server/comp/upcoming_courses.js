const express = require("express");
const router = express.Router();
const pool = require("./db");

// Middleware
router.use(express.json());

router.get("/upcoming-courses", async (req, res) => {
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
  