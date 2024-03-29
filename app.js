const mysql = require("mysql2/promise");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());
// Create a connection pool with promise support
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// API endpoint to get a random question
app.get("/", async (req, res) => {
  try {
    // Use the pool to get a connection
    const connection = await pool.getConnection();

    // Fetch a random question from the quiz_questions table
    const [results] = await connection.query(
      "SELECT * FROM `quiz_questions` ORDER BY RAND() LIMIT 1"
    );

    if (results.length === 0) {
      // No questions found
      return res.status(404).json({ error: "No questions found" });
    }

    // Print the random question to the console
    // console.log(results[0]);

    // Release the connection back to the pool
    connection.release();

    // Send the random question as a JSON response
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running......");
});
