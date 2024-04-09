// admin.js

const express = require('express');
const router = express.Router();
const pool = require('./db');

// Assign courses to teachers
router.post('/assign-courses', async (req, res) => {
  try {
    const { courseId, teacherIds } = req.body;

    // Validate input
    if (!courseId || !teacherIds || !Array.isArray(teacherIds)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Check if the course exists
    const courseQuery = 'SELECT * FROM courses WHERE courseId = $1';
    const courseResult = await pool.query(courseQuery, [courseId]);
    const course = courseResult.rows[0];
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Insert records into teachersTakeCourses table
    for (const teacherId of teacherIds) {
      const insertQuery = 'INSERT INTO teachersTakeCourses (teacherId, courseId) VALUES ($1, $2)';
      await pool.query(insertQuery, [teacherId, courseId]);
    }

    res.status(201).json({ success: 'Courses assigned successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Create a new course
router.post('/create-course', async (req, res) => {
  try {
    const { courseName, ects, startDate, endDate, level } = req.body;

    // Validate input
    if (!courseName || !ects || !startDate || !endDate || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert new course into courses table
    const insertQuery = `
      INSERT INTO courses (courseName, ects, startDate, endDate, level) 
      VALUES ($1, $2, $3, $4, $5) RETURNING courseId`;
    const result = await pool.query(insertQuery, [courseName, ects, startDate, endDate, level]);
    const courseId = result.rows[0].courseId;

    res.status(201).json({ courseId, success: 'Course created successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ error: 'Server Error' });
  }
});

module.exports = router;
