
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query(`
  SELECT
    current_database() AS database_name,
    current_schema() AS schema_name,
    to_regclass('schedules') AS schedules_table,
    EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'schedules'
        AND column_name = 'panelists'
    ) AS has_panelists
`)
.then((result) => {
  console.log("DATABASE DIAGNOSTIC:", result.rows[0]);
})
.catch((error) => {
  console.error("DATABASE DIAGNOSTIC ERROR:", error.message);
});


// Test database connection
pool.connect()
  .then((client) => {
    console.log("Neon PostgreSQL connected successfully!");
    client.release();
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

module.exports = pool;
