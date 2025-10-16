import { error } from "console";
import { db } from "../config/db.js";
import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";

export const UserService = {
    async getUser(email: string): Promise<User | null> {
        const result = await db.query<User>(`SELECT * FROM users WHERE email = ${email} LIMIT 1;`);
        return result.rows[0] || null;
    },

    async registerUser(email: string, nickname: string, password: string): Promise<User> {
        const existingUser = await this.getUser(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query<User>(
            `
            INSERT INTO users (email, nickname, password, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
            `,
            [email, nickname, hashedPassword]
        );

        return result.rows[0];
    },

    async loginUser(email: string, password: string): Promise<User> {
        const user = await this.getUser(email);
        if (!user) throw new Error("Invalid email");

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error("Invalid password");

        return user;
    }
}