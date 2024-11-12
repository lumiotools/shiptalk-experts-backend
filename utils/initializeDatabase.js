import pool from '../config/db.js';

async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS experts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(15),
      linkedin VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      company VARCHAR(255),
      designation VARCHAR(255),
      years_in_industry INT,
      profile_picture VARCHAR(255)
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("Experts table initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

export default initializeDatabase;
