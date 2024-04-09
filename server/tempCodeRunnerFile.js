app.get("/teacher-dashboard/:teacherid", async (req, res) => {
  try {
    const { teacherid } = req.params;

    // Fetch teacher information from the teachers table
    const teacherQuery = "SELECT * FROM teachers WHERE teacherid = $1";
    const teacherResult = await pool.query(teacherQuery, [teacherid]);
    const teacherInfo = teacherResult.rows[0];

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
    res.json({ teacherid, teacherInfo, assignedCourses });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});