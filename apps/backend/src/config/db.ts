import { Client } from "pg";
import dotenv from "dotenv";

// 🎯 ШАГ 1: ВЫВОДИМ ПЕРЕМЕННУЮ В КОНСОЛЬ
console.log("Attempting to connect with URL:", process.env.DATABASE_URL);

export const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => console.log("Connected to database"))
  .catch((err: Error) => console.error("DB connection error:", err));