// routes/dashboard.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const pool = require('../db');

// Dashboard route - protected
router.get('/', authenticate, async (req, res) => {
  try {
    // Fetch user data based on req.user
    const user = await pool.query('SELECT * FROM users WHERE userId = $1', [
      req.user.id
    ]);
    // Send user data as response
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
