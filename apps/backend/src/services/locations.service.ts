import { db } from "../config/db.js";
import { Location } from "../models/locations.model.js";
import { UserService } from "./users.service.js";

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
    },

    async findLocationById(id: number): Promise<Location | null> {
        const result = await db.query<Location>(
            `
            SELECT * FROM locations WHERE location_id = $1;
            `,
            [id]
        );
        return result.rows[0] || null;
    },

    async getRecommendedLocations(user_id: number, city: string): Promise<Location[]> {
        const user = await UserService.getUserById(user_id);
        if (!user) {
            throw new Error("User not found");
        }

        const preferred_budget_range = (user as any).preferred_budget_range;
        const preferred_venue_atmosphere = (user as any).preferred_venue_atmosphere;
        const preferred_beer_style_id = (user as any).preferred_beer_style_id;

        const query = `
            SELECT 
                l.*,
                COALESCE(ARRAY_AGG(DISTINCT lat.atmosphere_tag) FILTER (WHERE lat.atmosphere_tag IS NOT NULL), '{}') AS atmospheres,
                COALESCE(ARRAY_AGG(DISTINCT lbs.beer_style_id) FILTER (WHERE lbs.beer_style_id IS NOT NULL), '{}') AS beer_style_ids
            FROM locations l
            LEFT JOIN location_atmosphere_tags lat ON l.location_id = lat.location_id
            LEFT JOIN location_beer_styles lbs ON l.location_id = lbs.location_id
            WHERE l.city = $1
            GROUP BY l.location_id;
        `;

        const result = await db.query(query, [city]);
        const locations = result.rows;

        const scored = locations.map(loc => {
            let score = 0;
            if (preferred_budget_range && loc.average_budget_requirment === preferred_budget_range) score++;
            if (preferred_venue_atmosphere && loc.atmospheres.includes(preferred_venue_atmosphere)) score++;
            if (preferred_beer_style_id !== undefined && preferred_beer_style_id !== null && loc.beer_style_ids.includes(preferred_beer_style_id)) score++;
            return { loc, score };
        });

        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const ra = a.loc.rating ?? 0;
            const rb = b.loc.rating ?? 0;
            return rb - ra;
        });

        return scored.map(s => s.loc);
    }
};