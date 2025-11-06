import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

db.connect()
  .then(() => console.log("Connected to database"))
  .catch((err: Error) => console.error("DB connection error:", err));