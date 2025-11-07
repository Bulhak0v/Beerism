import { error } from "console";
import { db } from "../config/db.js";
import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";
import { editUser, editUserPreference } from "../controllers/users.controller.js";

export const UserService = {
    async getUser(email: string): Promise<User | null> {
        const result = await db.query<User>(
            `SELECT * FROM users WHERE email = $1 LIMIT 1;`,
            [email]
        );
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
    },

    async addUser(email: string, nickname: string, password: string, profile_picture: string, bio: string, preffered_budget_range: string, preferred_venue_atmosphere: string, preferred_beer_style_id: number, xp: number, level: number): Promise<User> {
        const result = await db.query<User>(
            `
            INSERT INTO users (email, nickname, password, profile_picture, bio, preffered_budget_range, preferred_venue_atmosphere, preferred_beer_style_id, xp, level)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
            `,
            [email, nickname, password, profile_picture, bio, preffered_budget_range, preferred_venue_atmosphere, preferred_beer_style_id, xp, level]
        );

        return result.rows[0];
    },

    async getUserById(user_id: number): Promise<User | null> {
        const result = await db.query<User>(`SELECT * FROM users WHERE user_id = ${user_id} LIMIT 1;`);
        return result.rows[0] || null;
    },

    async editUser(user_id: number, updateData: Partial<User>): Promise<User | null> {
        const user = await this.getUserById(user_id);
        if (!user) {
            return null;
        }

        const fields = Object.keys(updateData).filter(key => (updateData as any)[key] !== undefined);

        if (fields.length === 0) {
            return user;
        }

        const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");

        const values = fields.map(field => updateData[field as keyof User]);

        const query = `
        UPDATE users
        SET ${setClause}
        WHERE user_id = $${fields.length + 1}
        RETURNING *;
    `;

        const result = await db.query<User>(query, [...values, user_id]);

        return result.rows[0];
    },

    async updateUser(user_id: number, updateData: Partial<User>): Promise<User | null> {
        const user = await this.getUserById(user_id);
        if (!user) return null;

        const fields = Object.keys(updateData).filter(
            key => (updateData as any)[key] !== undefined
        );

        if (fields.length === 0) return user;

        const setClause = fields.map((field, i) => `"${field}" = $${i + 1}`).join(", ");
        const values = fields.map(field => updateData[field as keyof User]);

        const query = `
        UPDATE users
        SET ${setClause}
        WHERE user_id = $${fields.length + 1}
        RETURNING *;
    `;

        const result = await db.query<User>(query, [...values, user_id]);
        return result.rows[0];
    },


    async editUserPreference(user_id: number, updateData: Partial<User>): Promise<User | null> {
        const user = await this.getUserById(user_id);
        if (!user) {
            return null;
        }

        const fields = Object.keys(updateData).filter(key => (updateData as any)[key] !== undefined);

        if (fields.length === 0) {
            return user;
        }

        const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");

        const values = fields.map(field => updateData[field as keyof User]);

        const query = `
        UPDATE users
        SET ${setClause}
        WHERE user_id = $${fields.length + 1}
        RETURNING *;
    `;

        const result = await db.query<User>(query, [...values, user_id]);

        return result.rows[0];
    },

    async deleteUser(id: number): Promise<number | null> {
        const query = "DELETE FROM users WHERE user_id = $1";
        const values = [id];
        const result = await db.query(query, values);
        return result.rowCount;
    },

}