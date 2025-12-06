import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

export default pool;

// Helper function for queries
export async function query<T = any>(sql: string, values?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, values);
    return results as T;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Helper for single row queries
export async function queryOne<T = any>(
  sql: string,
  values?: any[]
): Promise<T | null> {
  try {
    const results = await query<T[]>(sql, values);
    return results && results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Database queryOne error:", error);
    throw error;
  }
}
