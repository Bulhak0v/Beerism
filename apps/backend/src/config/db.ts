import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("Attempting to connect with URL:", process.env.DATABASE_URL);

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect()
  .then((client) => {
    console.log("Connected to database pool");
    client.release();
  })
  .catch((err: Error) => console.error("DB connection error:", err));