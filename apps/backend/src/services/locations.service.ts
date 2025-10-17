import { db } from "../config/db.js";
import { Location } from "../models/locations.model.js";

export const LocationsService = {
    async getAll(): Promise<Location[]> {
        const result = await db.query("SELECT * FROM locations");
        return result.rows;
    },

    async delete(id: number): Promise<number | null> {
        const query = "DELETE FROM locations WHERE location_id = $1";
        const values = [id];
        const result = await db.query(query, values);
        return result.rowCount;
    },

    async addLocation(name: string, description: string, city: string, adress: string, website: string, rating: number, average_budget_requirment: string, opens_at: string, closes_at: string, latitude: number, longtitude: number): Promise<Location> {
        const result = await db.query<Location>(
            `
            INSERT INTO locations (name, description, city, adress, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
            `,
            [name, description, city, adress, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude]
        );

        return result.rows[0];
    },

    async updateLocation(id: number,name: string, description: string, city: string, adress: string, website: string, rating: number, average_budget_requirment: string, opens_at: string, closes_at: string, latitude: number, longtitude: number): Promise<Location> {
        const result = await db.query<Location>(
            `
            UPDATE locations
            SET name = $1, description = $2, city = $3, adress = $4, website = $5, rating = $6, average_budget_requirment = $7, opens_at = $8, closes_at = $9, latitude = $10, longtitude = $11
            WHERE location_id = $12
            RETURNING *;
            `,
            [name, description, city, adress, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude, id]
        );

        if (result.rows.length === 0) {
            throw new Error("Location not found");
        }

        return result.rows[0];
    }

};