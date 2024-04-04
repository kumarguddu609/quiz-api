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

// API endpoint to get 15 random questions
app.get("/", async (req, res) => {
  try {
    // Use the pool to get a connection
    const connection = await pool.getConnection();

    // Fetch total number of questions
    const [countRows] = await connection.query("SELECT COUNT(*) AS total FROM `quiz_questions`");
    const totalQuestions = countRows[0].total;

    // Generate 15 unique random indices
    const uniqueRandomIndices = generateUniqueRandomIndices(totalQuestions, 15);

    // Fetch 15 random questions from the quiz_questions table
    const questionsPromises = uniqueRandomIndices.map(async index => {
      const [results] = await connection.query(
        "SELECT * FROM `quiz_questions` LIMIT ?, 1",
        [index]
      );
      return results[0];
    });

    const questions = await Promise.all(questionsPromises);

    // Release the connection back to the pool
    connection.release();

    // Send the random questions as a JSON response
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to generate unique random indices
function generateUniqueRandomIndices(max, count) {
  const indices = new Set();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * max));
  }
  return Array.from(indices);
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running......");
});
